// routes/big-commerce/orders/route.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const pool = require('../../../modules/pool');
const pdf = require('html-pdf-node');

// ----------------------------- Config ----------------------------------

if (process.env.SERVER_ENV === 'prod') {
  setInterval(() => syncOrders('htw'), 10 * 60 * 1000);
  setInterval(() => syncOrders('sff'), 10 * 60 * 1000);
}

const ALLOWED_STATUSES = new Set(['Awaiting Fulfillment', 'Awaiting Payment']);

const STATUS_MAP = {
  0: 'Incomplete',
  1: 'Pending',
  2: 'Shipped',
  3: 'Partially Shipped',
  4: 'Refunded',
  5: 'Cancelled',
  6: 'Declined',
  7: 'Awaiting Payment',
  8: 'Awaiting Pickup',
  9: 'Awaiting Shipment',
  10: 'Completed',
  11: 'Awaiting Fulfillment',
  12: 'Manual Verification Required',
  13: 'Disputed',
  14: 'Partially Refunded',
};

const DATABASE_MAP = {
  htw: 'picklist_orders',
  sff: 'sff_picklist_orders',
};

const DELETED_IDS_DB_MAP = {
  htw: 'deleted_order_ids',
  sff: 'sff_deleted_order_ids',
};

const clothingKeywords = ['clothing', 'towel', 'youth', 'womens', 'bottoms'];

// Webhook delay/debounce: give BigCommerce time to flip out of "Incomplete"
const PENDING_TIMERS = new Map(); // order_id -> timeout
const DELAY_MS = 5_000; // initial delay after webhook
const MAX_RETRIES = 3; // how many times to recheck if still Incomplete
const BACKOFF_MS = 5_000; // wait between retries

// Sync concurrency + pagination
const SYNC_TARGET = 50; // aim to add up to 50 valid orders
const SYNC_CONCURRENCY = 8; // parallel workers for product fetch + insert
const SYNC_PAGE_SIZE = 50;

const storeMap = {
  sandbox: {
    hash: process.env.SANDBOX_HASH,
    token: process.env.SANDBOX_API_KEY,
  },
  htw: {
    hash: process.env.STORE_HASH,
    token: process.env.BG_AUTH_TOKEN,
  },
  sff: {
    hash: process.env.SFF_STORE_HASH,
    token: process.env.SFF_AUTH_TOKEN,
  },
};

// Store API tokens and expiry times by store key
const apiTokens = {
  sandbox: { token: null, expiry: null },
  htw: { token: null, expiry: null },
  sff: { token: null, expiry: null },
};

// Request a new token for a given store
const getApiToken = async (storeKey) => {
  const storeData = storeMap[storeKey];
  if (!storeData) throw new Error(`Invalid store key: ${storeKey}`);

  const expiresAtUnix = Math.floor(Date.now() / 1000) + 1800;

  const url = `https://api.bigcommerce.com/stores/${storeData.hash}/v3/storefront/api-token`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': storeData.token,
      },
      body: JSON.stringify({
        channel_id: 1, // Adjust if needed
        expires_at: expiresAtUnix,
      }),
    });

    const json = await response.json();

    if (!json.data?.token) {
      throw new Error(`Failed to retrieve token from BigCommerce for ${storeKey}`);
    }

    apiTokens[storeKey] = {
      token: json.data.token,
      expiry: expiresAtUnix * 1000, // convert to ms
    };

    return json.data.token;
  } catch (err) {
    console.error(`Error fetching API token for ${storeKey}:`, err);
    throw err;
  }
};

// Get a valid (possibly cached) token for a given store
const getValidApiToken = async (storeKey) => {
  const { token, expiry } = apiTokens[storeKey] || {};
  const bufferTime = 60 * 1000; // 1 min buffer

  const isExpired = !token || Date.now() >= expiry - bufferTime;

  if (isExpired) {
    return await getApiToken(storeKey);
  }

  return token;
};

// -----------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------

const getBaseUrl = () => {
  // server-side: decide based on environment
  return process.env.NODE_ENV === 'production'
    ? 'https://admin.heattransferwarehouse.com'
    : 'http://localhost:8000';
};

/**
 * Fetches JSON from a given URL with BigCommerce authentication headers.
 *
 * @param {string} url - The endpoint to fetch.
 * @param {object} [options={}] - Optional fetch options (method, headers, body, etc.).
 *                                These override or extend the default values.
 * @returns {Promise<object>} - Resolves with parsed JSON response.
 * @throws {Error} - Throws if the response status is not OK (>=400).
 */
const fetchJSON = async (url, storeKey, options = {}) => {
  if (!url) return undefined; // early return if url is missing

  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Auth-Token': storeMap[storeKey].token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      ...options,
    });

    if (!resp.ok) {
      // swallow the error and just return undefined
      return undefined;
    }

    return await resp.json().catch(() => undefined);
  } catch {
    return undefined; // catch network/other errors
  }
};

// Run tasks with a concurrency limit
/**
 * Executes a list of async tasks with a maximum concurrency limit.
 *
 * @param {Array<Function>} tasks - An array of functions, each returning a Promise (async task).
 * @param {number} limit - Maximum number of tasks to run in parallel.
 * @returns {Promise<Array>} - Resolves with an array of results in the same order as the tasks.
 */
const runWithConcurrencyLimit = async (tasks, limit) => {
  // Pre-allocate an array for results, same length as tasks

  const results = new Array(tasks.length);

  // Shared index tracker for which task should be run next
  let idx = 0;

  /**
   * Worker function:
   * - Repeatedly takes the next available task (based on shared `idx`)
   * - Executes it, and saves its result in the correct slot in `results`
   * - Stops when no tasks are left
   */
  const worker = async () => {
    while (idx < tasks.length) {
      // Capture the current index, then increment for the next worker
      const myIdx = idx++;
      try {
        // Run the task and store its result
        results[myIdx] = await tasks[myIdx]();
      } catch (e) {
        // Catch errors so one failed task doesn't crash the whole run
        console.error('Task error:', e);
        results[myIdx] = null;
      }
    }
  };

  // Launch `limit` number of workers (or fewer if fewer tasks exist)
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));

  // Return all task results in original order
  return results;
};

/**
 *
 * @param {object} order
 * @param {object} consignments
 * @param {object} lineItems
 * @returns
 */
const buildOrderJSON = async (
  order,
  consignments,
  lineItems,
  coupons,
  notes,
  customerOrders,
  paymentMethod
) => {
  // Build a structured order JSON object

  return {
    order_id: order.id,
    date_created: order.date_created,
    staff_notes: notes.staff_notes,
    customer_notes: notes.customer_notes,
    line_items: lineItems,
    shipping: {
      first_name: consignments.first_name,
      last_name: consignments.last_name,
      company: consignments.company,
      shipping_method: consignments.shipping_method,
      cost_inc_tax: consignments.cost_inc_tax,
      street_1: consignments.street_1,
      street_2: consignments.street_2,
      city: consignments.city,
      state: consignments.state,
      zip: consignments.zip,
      country: consignments.country,
    },
    customer: {
      first_name: order.billing_address?.first_name,
      last_name: order.billing_address?.last_name,
      email: order.billing_address?.email,
      phone: order.billing_address?.phone,
      company: order.billing_address?.company,
      is_first_order: customerOrders?.length === 1,
    },
    subtotal: order.subtotal_ex_tax,
    tax: order.total_tax,
    grand_total: order.total_inc_tax,
    total_items: order.items_total,
    status: order.status,
    coupon_name: coupons.coupon_name,
    coupon_value: coupons.coupon_value,
    payment_method: paymentMethod,
  };
};

// -----------------------------------------------------------------------
// BigCommerce helpers
// -----------------------------------------------------------------------

/**
 * Recursively unwraps GraphQL "edges → node" structures into plain objects/arrays.
 *
 * BigCommerce (and many GraphQL APIs) wrap lists in:
 *   { edges: [ { node: {...} }, { node: {...} } ] }
 *
 * This helper flattens that pattern so you get just the array of nodes:
 *   [ {...}, {...} ]
 *
 * @param {any} obj - The object/array/value to unwrap.
 * @returns {any} - A new object/array/value with edges stripped out.
 */
const unwrapEdges = (obj) => {
  // Case 1: If it's an array, recurse into each element
  if (Array.isArray(obj)) {
    return obj.map(unwrapEdges);
  }

  // Case 2: If it's a non-null object, check for edges or recurse deeper
  else if (obj && typeof obj === 'object') {
    // If this object has `edges`, return an array of unwrapped nodes
    if (obj.edges) {
      return obj.edges.map((edge) => unwrapEdges(edge.node));
    }

    // Otherwise, recurse into each property of the object
    const newObj = {};
    for (const key in obj) {
      newObj[key] = unwrapEdges(obj[key]);
    }
    return newObj;
  }

  // Case 3: Primitive (string, number, boolean, null, undefined)
  return obj;
};

// -----------------------------------------------------------------------------
// Returns a valid Storefront API token, refreshing from the server if needed.
// -----------------------------------------------------------------------------
// - Uses a cached token stored in `storeFrontToken`
// - Adds a 1-minute buffer before expiry to avoid race conditions
// - Calls `getStoreFrontToken(storeKey)` to refresh when expired
//
// @returns {Promise<string>} A valid Storefront API token
// -----------------------------------------------------------------------------

const getProductsOnOrder = async (url, storeKey) => {
  return fetchJSON(url, storeKey);
};

const fetchGraphQL = async (query, storeKey) => {
  const token = await getValidApiToken(storeKey);
  const url = `https://store-${storeMap[storeKey].hash}-1.mybigcommerce.com/graphql`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  });

  const text = await resp.text();
  if (!resp.ok) throw new Error(`GraphQL failed: ${resp.status} ${text}`);
  return JSON.parse(text);
};

/**
 * Fetch categories for a given product from BigCommerce GraphQL Storefront API.
 * https://developer.bigcommerce.com/graphql-storefront/reference#definition-CategoryConnection
 *
 * @param {number} productId - The product entity ID
 * @returns {Promise<Array<{ name: string }>>} - Returns an array of category objects (empty if none found)
 */
const batchGetProductCategories = async (productIds, storeKey, chunkSize = 5) => {
  const results = {};

  for (let i = 0; i < productIds.length; i += chunkSize) {
    const chunk = productIds.slice(i, i + chunkSize);

    const query = `
      query {
        site {
          ${chunk
            .map(
              (id, idx) => `
              c${i + idx}: product(entityId: ${id}) {
                entityId
                categories {
                  edges { node { name } }
                }
              }
            `
            )
            .join('\n')}
        }
      }
    `;

    const json = await fetchGraphQL(query, storeKey);

    if (json?.data?.site) {
      for (const key in json.data.site) {
        const prod = json.data.site[key];
        if (prod) {
          results[prod.entityId] = unwrapEdges(prod.categories);
        }
      }
    }
  }

  return results; // { productId: [categories] }
};

/**
 * Fetch variant metafields for a product/variant
 * @param {number} productId
 * @param {number} variantId
 * @returns {Promise<Array>} - Returns an array of metafields (empty if not found)
 */
const batchGetVariantMetaFields = async (variantPairs, storeKey, chunkSize = 3) => {
  const results = {};

  for (let i = 0; i < variantPairs.length; i += chunkSize) {
    const chunk = variantPairs.slice(i, i + chunkSize);

    // Each alias encodes product + variant
    const query = `
  query {
    ${chunk
      .map(
        ({ productId, variantId }, idx) => `
        pv${i + idx}: site {
          product(entityId: ${productId}) {
            entityId
            variants(entityIds: [${variantId}]) {
              edges {
                node {
                  entityId
                  metafields(namespace: "shipping.shipperhq") {
                    edges { node { key value } }
                  }
                }
              }
            }
          }
        }
      `
      )
      .join('\n')}
  }
`;

    const json = await fetchGraphQL(query, storeKey);

    for (const key in json.data) {
      const prod = json.data[key]?.product;
      if (!prod) continue;

      const productId = prod.entityId;
      const variants = unwrapEdges(prod.variants);

      variants.forEach((v) => {
        if (v) {
          // key like "12345:67890"
          results[`${productId}:${v.entityId}`] = unwrapEdges(v.metafields);
        }
      });
    }
  }

  return results;
};

/**
 * Fetch product metafields for a given namespace
 * https://developer.bigcommerce.com/graphql-storefront/reference#definition-MetafieldConnection
 *
 * @param {number} productId - The product entity ID
 * @returns {Promise<Array>} - Returns an array of metafields (empty if none found)
 */
const batchGetProductMetaFields = async (productIds, storeKey, chunkSize = 5) => {
  const results = {};

  for (let i = 0; i < productIds.length; i += chunkSize) {
    const chunk = productIds.slice(i, i + chunkSize);

    const query = `
      query {
        site {
          ${chunk
            .map(
              (id, idx) => `
              p${i + idx}: product(entityId: ${id}) {
                entityId
                metafields(namespace: "shipping.shipperhq") {
                  edges { node { key value } }
                }
              }
            `
            )
            .join('\n')}
        }
      }
    `;

    const json = await fetchGraphQL(query, storeKey);

    if (json?.data?.site) {
      for (const key in json.data.site) {
        const prod = json.data.site[key];
        if (prod) {
          results[prod.entityId] = unwrapEdges(prod.metafields);
        }
      }
    }
  }

  return results; // { productId: [metafields] }
};

/**
 * https://developer.bigcommerce.com/graphql-storefront/reference#definition-MetafieldConnection
 * @param {Object} metaFields
 * @returns {boolean} - Returns true if any metafield indicates dropship
 */
/**
 * Returns true only if metafields explicitly contain "drop ship"
 */
/**
 * Returns true only if metafields explicitly contain a dropship marker
 */
const determineDropShipStatus = (metaFields) => {
  if (!metaFields || !Array.isArray(metaFields)) return false;

  return metaFields.some((field) => {
    if (!field || field.key !== 'shipping-groups' || !field.value) return false;

    // Parse value (it might be JSON array or plain string)
    let values = [];
    try {
      const parsed = JSON.parse(field.value);
      values = Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      values = [String(field.value)];
    }

    return values.some(
      (v) => /\bdrops?\s*-?\s*ship\b/i.test(String(v)) // matches "dropship", "drop-ship", "drop ship"
    );
  });
};

/**
 * https://developer.bigcommerce.com/docs/rest-management/orders/order-products
 * @param {object} products
 * https://developer.bigcommerce.com/docs/rest-management/orders
 * @param {object} order
 * @returns {Promise<object>} - Returns a JSON object with order details
 */
const processLineItems = async (products, order, storeKey) => {
  const productIds = Array.from(new Set(products.map((p) => p.product_id).filter(Boolean)));
  const variantPairs = products
    .filter((p) => p.product_id && p.variant_id)
    .map((p) => ({ productId: p.product_id, variantId: p.variant_id }));

  // 🚀 Fetch in parallel (batched + chunked)
  const [productMetaMap, variantMetaMap, categoriesMap] = await Promise.all([
    batchGetProductMetaFields(productIds, storeKey),
    batchGetVariantMetaFields(variantPairs, storeKey),
    batchGetProductCategories(productIds, storeKey),
  ]);

  // Build each line item with local lookups (no more HTTP spam 🎉)
  return products.map((p) => {
    const productMetaFields = productMetaMap[p.product_id] || [];
    const variantMetaFields = variantMetaMap[`${p.product_id}:${p.variant_id}`] || [];
    const productCategories = categoriesMap[p.product_id] || [];

    const isProductDropship = determineDropShipStatus(productMetaFields);
    const isVariantDropship = determineDropShipStatus(variantMetaFields);

    const isClothingProduct = productCategories.some((cat) =>
      clothingKeywords.some((kw) => cat?.name?.trim().toLowerCase().includes(kw))
    );

    return {
      id: p.id,
      order_id: order.id,
      product_id: p.product_id,
      name: p.name,
      sku: p.sku,
      quantity: p.quantity,
      price: p.total_inc_tax,
      bin_picking_number: p.bin_picking_number,
      is_clothing: isClothingProduct,
      is_dropship: isProductDropship || isVariantDropship,
      options: (p.product_options || []).map((opt) => ({
        display_name: opt.display_name,
        display_value: opt.display_value,
      })),
    };
  });
};

const getOrderFromCustomer = async (customerId, storeKey) => {
  const url = ` https://api.bigcommerce.com/stores/${storeMap[storeKey].hash}/v2/orders?customer_id=${customerId}`;
  const response = await fetchJSON(url, storeKey);
  return response;
};

/**
 * https://developer.bigcommerce.com/docs/rest-management/orders#get-an-order
 * @param {Int} orderID
 * @returns {Promise<object>} - Returns a JSON object with order details
 */
const getOrderData = async (orderID, storeKey) => {
  const url = `https://api.bigcommerce.com/stores/${storeMap[storeKey].hash}/v2/orders/${orderID}?include=consignments`;
  const order = await fetchJSON(url, storeKey);
  console.log(order);

  const customerId = order.customer_id;

  const customerOrders = await getOrderFromCustomer(customerId, storeKey);

  // Separate consignments shipping info
  const cons = order.consignments?.[0]?.shipping?.[0] || {};

  const paymentMethod = order.payment_method;

  // Get products on order based on order.products.url
  const products = await getProductsOnOrder(order.products.url, storeKey);

  const cleanedStaffNotes = (order.staff_notes || '')
    // remove specific NoFraud error
    .replace(/NoFraud encountered an error "Not Authorized"\.\s*/i, '')
    // remove "Skipped due to requested blocked gateway"
    .replace(/Skipped due to requested blocked gateway\.?\s*/i, '')
    // flatten line breaks
    .replace(/[\r\n]+/g, ' ')
    .trim();

  const notes = {
    staff_notes: cleanedStaffNotes,
    customer_notes: order.customer_message || '',
  };

  const coupons = {
    coupon_name: null,
    coupon_value: null,
  };

  const couponData = await fetchJSON(order.coupons.url, storeKey);

  if (couponData && Array.isArray(couponData)) {
    coupons.coupon_name = couponData[0]?.code || null;
    coupons.coupon_value = parseFloat(couponData[0]?.discount) || null;
  }

  // Build line items with product and variant metadata and categories
  const line_items = await processLineItems(products, order, storeKey);

  // Build the final order JSON
  const json = await buildOrderJSON(
    order,
    cons,
    line_items,
    coupons,
    notes,
    customerOrders,
    paymentMethod
  );

  return json;
};

// -----------------------------------------------------------------------
// DB
// -----------------------------------------------------------------------

/**
 *
 * @param {Object} orderData
 * @returns {Promise<{ success: boolean, order?: object, message?: string, error?: Error }>} - Returns an object indicating success or failure
 */
const addOrderToDatabase = async (orderData, storeKey) => {
  try {
    if (!orderData?.order_id) return { success: false, message: 'Missing order_id' };
    if (!orderData?.status) return { success: false, message: 'Missing status' };

    const {
      order_id,
      line_items,
      shipping,
      customer,
      subtotal,
      tax,
      grand_total,
      total_items,
      status,
      date_created,
      coupon_name,
      coupon_value,
      staff_notes,
      customer_notes,
      payment_method,
    } = orderData;

    const existing = await pool.query(
      `SELECT id FROM ${DATABASE_MAP[storeKey]} WHERE order_id = $1`,
      [order_id]
    );
    if (existing.rows.length > 0) {
      return { success: false, message: 'Order already exists' };
    }

    const result = await pool.query(
      `
      INSERT INTO ${DATABASE_MAP[storeKey]} (
        order_id,
        created_at,
        line_items,
        shipping,
        customer,
        subtotal,
        tax,
        grand_total,
        status,
        total_items,
        coupon_name,
        coupon_value,
        staff_notes,
        customer_notes${storeKey === 'sff' ? ', payment_method' : ''}
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14${storeKey === 'sff' ? ', $15' : ''})
      RETURNING *;
      `,
      [
        order_id,
        date_created, // DB column should be timestamptz; Postgres can parse RFC822/ISO strings
        JSON.stringify(line_items),
        JSON.stringify(shipping),
        JSON.stringify(customer),
        subtotal,
        tax,
        grand_total,
        status,
        total_items,
        coupon_name,
        coupon_value,
        staff_notes,
        customer_notes,
        payment_method,
      ]
    );

    return { success: true, order: result.rows[0] };
  } catch (err) {
    console.error('Error inserting order:', err);
    return { success: false, message: 'Failed to insert order', error: err };
  }
};

async function updateOrder(orderId, storeKey) {
  try {
    const data = await getOrderData(orderId, storeKey);
    if (!data) {
      console.log(`No data returned for order ${orderId}`);
      return;
    }

    const result = await pool.query(
      `
      UPDATE ${DATABASE_MAP[storeKey]}
      SET
        line_items = $1,
        shipping = $2,
        customer = $3,
        subtotal = $4,
        tax = $5,
        grand_total = $6,
        total_items = $7,
        status = $8,
        coupon_name = $9,
        coupon_value = $10,
        staff_notes = $11,
        customer_notes = $12
      WHERE order_id = $13
      RETURNING *;
    `,
      [
        JSON.stringify(data.line_items),
        JSON.stringify(data.shipping),
        JSON.stringify(data.customer),
        data.subtotal,
        data.tax,
        data.grand_total,
        data.total_items,
        data.status,
        data.coupon_name,
        data.coupon_value,
        data.staff_notes,
        data.customer_notes,
        orderId,
      ]
    );

    if (result.rows.length === 0) {
      console.log(`Order ${orderId} not found in database for update.`);
    } else {
      console.log(`Order ${orderId} updated successfully.`);
    }
  } catch (err) {
    console.error(`Error updating order ${orderId}:`, err);
  }
}

// -----------------------------------------------------------------------
// Per-order delayed processing for webhook
// -----------------------------------------------------------------------

// Processes a single order with retries and backoff
async function processSingleOrder(orderId, storeKey, manualAdd = false, attempt = 1) {
  try {
    const data = await getOrderData(orderId, storeKey);

    if (!data) {
      console.log(`⚪️ Order ${orderId}: no data returned`);
      return;
    }
    const status = (data.status || '').trim();

    // Check if status is allowed
    if (!ALLOWED_STATUSES.has(status) && !manualAdd) {
      // If status is Incomplete, retry with backoff
      if (status === 'Incomplete' && attempt < MAX_RETRIES) {
        console.log(`⏳ Order ${orderId} is Incomplete, retrying attempt ${attempt + 1}...`);

        setTimeout(() => processSingleOrder(orderId, storeKey, manualAdd, attempt + 1), BACKOFF_MS);
      } else {
        // If not allowed or max retries reached, skip
        console.log(`⏭️ Skipping order ${orderId} (status: ${status || 'N/A'})`);
      }
      return;
    }

    // If we reach here, the order is valid and we can add it to the database
    const result = await addOrderToDatabase(data, storeKey);
    if (result?.success) {
      console.log(`✅ Order ${orderId} added`);
    } else {
      console.log(`⚠️ Order ${orderId} not added: ${result?.message || 'unknown error'}`);
    }
  } catch (e) {
    console.error(`❌ Error processing order ${orderId}:`, e);
  }
}

// Schedules an order for processing after a delay
function scheduleOrderProcess(orderId, storeKey, delayMs = DELAY_MS) {
  // Clear any existing timer for this order
  const existing = PENDING_TIMERS.get(orderId);
  if (existing) clearTimeout(existing);

  // Set a new timer
  const t = setTimeout(() => {
    PENDING_TIMERS.delete(orderId);
    processSingleOrder(orderId, storeKey, false);
  }, delayMs);

  PENDING_TIMERS.set(orderId, t);
}

// -----------------------------------------------------------------------
// Full sync (paginated + concurrent)
// -----------------------------------------------------------------------

/**
 * Synchronizes orders from BigCommerce into your local database.
 *
 * Flow:
 *  1. Fetch a single page of orders from BigCommerce REST API (v2).
 *  2. Filter out disallowed statuses (skip incomplete, etc).
 *  3. For allowed orders, build async tasks to:
 *      - Fetch products on the order
 *      - Enrich line items with categories + variant metadata
 *      - Construct final order JSON
 *      - Insert into database
 *  4. Run tasks concurrently with a max concurrency cap.
 *  5. Return stats: added, skipped, results.
 *
 * @returns {Promise<{success: boolean, added: number, skipped_incomplete: number, results: Array}>}
 */
async function syncOrders(storeKey) {
  // How many orders to sync in one run (cap)
  const addedTarget = SYNC_TARGET; // e.g., 50

  // BigCommerce v2 Orders API endpoint (one page only)
  const url = `https://api.bigcommerce.com/stores/${storeMap[storeKey].hash}/v2/orders?limit=${
    SYNC_PAGE_SIZE || 100
  }&sort=date_created:desc&include=consignments`;

  let added = 0;
  let skippedIncomplete = 0;
  const results = [];

  // 1) Fetch a single page of orders
  const orders = await fetchJSON(url, storeKey);

  if (!orders) {
    return { success: false, added: 0, skipped_incomplete: 0, results: [] };
  }

  if (!orders?.length) {
    return { success: true, added: 0, skipped_incomplete: 0, results: [] };
  }

  // 2) Build task list for eligible orders only
  const tasks = [];
  for (const o of orders) {
    const status = (o.status || '').trim();

    // Skip orders not in allowed statuses
    if (!ALLOWED_STATUSES.has(status)) {
      if (status === 'Incomplete') skippedIncomplete++;
      continue;
    }

    // Wrap order processing logic in an async task
    tasks.push(async () => {
      try {
        // Extract first consignment's shipping info
        const cons = o.consignments?.[0]?.shipping?.[0] || {};

        const customerOrders = await getOrderFromCustomer(o.customer_id, storeKey);

        // Fetch products for this order
        const products = await getProductsOnOrder(o.products.url, storeKey);

        const paymentMethod = o.payment_method;

        // Enrich line items with variant metadata + categories
        const line_items = await processLineItems(products, o, storeKey);

        const cleanedStaffNotes = (o.staff_notes || '')
          .replace(/NoFraud encountered an error "Not Authorized"\.\s*/i, '') // remove that phrase + period + spaces
          .replace(/[\r\n]+/g, ' ') // flatten line breaks
          .trim();

        const notes = {
          staff_notes: cleanedStaffNotes,
          customer_notes: o.customer_message || '',
        };

        const coupons = {
          coupon_name: null,
          coupon_value: null,
        };

        const couponData = await fetchJSON(o.coupons.url, storeKey);

        if (couponData && Array.isArray(couponData)) {
          coupons.coupon_name = couponData[0]?.code || null;
          coupons.coupon_value = parseFloat(couponData[0]?.discount) || null;
        }

        // Build normalized order JSON object
        const json = await buildOrderJSON(
          o,
          cons,
          line_items,
          coupons,
          notes,
          customerOrders,
          paymentMethod
        );

        // Insert order into database
        const out = await addOrderToDatabase(json, storeKey);

        // Return inserted order or null if failed
        return out?.success ? out.order : null;
      } catch (e) {
        console.error(`Task failed for order ${o.id}:`, e.message || e);
        return null;
      }
    });
  }

  // No valid tasks? Return early
  if (!tasks.length) {
    return { success: true, added: 0, skipped_incomplete: skippedIncomplete, results: [] };
  }

  // 3) Run tasks with concurrency limiter (e.g., 8 at a time)
  const raw = await runWithConcurrencyLimit(tasks, SYNC_CONCURRENCY);

  // Keep only up to `addedTarget` successful inserts
  const inserted = raw.filter(Boolean).slice(0, addedTarget);

  added = inserted.length;
  results.push(...inserted);

  // 4) Return sync stats
  return { success: true, added, skipped_incomplete: skippedIncomplete, results };
}

async function updateOrderStatus(orderId, newStatus, storeKey) {
  try {
    const result = await pool.query(
      `
      UPDATE ${DATABASE_MAP[storeKey]}
      SET status = $1
      WHERE order_id = $2
      RETURNING *;
    `,
      [newStatus, orderId]
    );
    if (result.rows.length === 0) {
      console.log(`Order ${orderId} not found in database for status update.`);
    } else {
      console.log(`Order ${orderId} status updated to "${newStatus}".`);
    }
  } catch (err) {
    console.error(`Error updating status for order ${orderId}:`, err);
  }
}

function tokenizeQuery(query) {
  const tokens = [];
  const parts = query.match(/(?:[^\s"]+:"[^"]+"|\S+)/g) || [];

  let buffer = '';
  parts.forEach((part) => {
    if (buffer) {
      // If buffer is holding a prefixed token, append until we see a new prefix
      if (/^\w+:/i.test(part)) {
        tokens.push(buffer.trim());
        buffer = part;
      } else {
        buffer += ' ' + part;
      }
    } else {
      buffer = part;
    }
  });

  if (buffer) tokens.push(buffer.trim());

  return tokens.map((t) => t.replace(/^(\w+:)"(.*)"$/, '$1$2')); // strip quotes if they exist
}

function handleSearch(query) {
  let conditions = [];
  let params = [];

  if (query) {
    const tokens = tokenizeQuery(query);
    let freeText = [];

    tokens.forEach((t) => {
      if (t.toLowerCase().startsWith('status:')) {
        const val = t
          .replace(/^status:/i, '')
          .trim()
          .replace(/^"|"$/g, '');
        params.push(`%${val}%`);
        conditions.push(`status ILIKE $${params.length}`);
      } else if (t.toLowerCase().startsWith('customer:')) {
        // Remove the `customer:` prefix
        const rest = t.replace(/^customer:/i, '').trim();

        // Split into parts -> e.g. "email:foo"
        const [subKey, ...valueParts] = rest.split(':');
        const val = valueParts.join(':').trim(); // allows spaces and multiple colons
        const paramIndex = params.length + 1;

        if (subKey.toLowerCase() === 'email' && val) {
          params.push(`%${val.toLowerCase()}%`);
          conditions.push(`LOWER(customer->>'email') LIKE $${paramIndex}`);
        } else if (subKey.toLowerCase() === 'first_name' && val) {
          params.push(`%${val.toLowerCase()}%`);
          conditions.push(`LOWER(customer->>'first_name') LIKE $${paramIndex}`);
        } else if (subKey.toLowerCase() === 'last_name' && val) {
          params.push(`%${val.toLowerCase()}%`);
          conditions.push(`LOWER(customer->>'last_name') LIKE $${paramIndex}`);
        } else {
          // fallback = generic "customer:foo" → matches email OR full name
          params.push(`%${rest.toLowerCase()}%`);
          conditions.push(`
      (
        LOWER(customer->>'email') LIKE $${paramIndex}
        OR customer->>'company' ILIKE $${params.length}
        OR (LOWER(COALESCE(customer->>'first_name','')) || ' ' || LOWER(COALESCE(customer->>'last_name','')))
           LIKE $${paramIndex}
      )
    `);
        }
      } else if (t.toLowerCase().startsWith('sku:')) {
        const val = t.replace(/^sku:/i, '').trim();
        params.push(`%${val.toLowerCase()}%`);
        conditions.push(`
          EXISTS (
            SELECT 1
            FROM jsonb_array_elements(line_items) li
            WHERE li->>'sku' ILIKE $${params.length}
          )
        `);
      } else if (t.toLowerCase().startsWith('product:')) {
        const val = t.replace(/^product:/i, '').trim();
        params.push(`%${val.toLowerCase()}%`);
        conditions.push(`
          EXISTS (
            SELECT 1
            FROM jsonb_array_elements(line_items) li
            WHERE li->>'name' ILIKE $${params.length}
          )
        `);
      } else if (t.toLowerCase().startsWith('company:')) {
        const val = t.replace(/^company:/i, '').trim();
        params.push(`%${val.toLowerCase()}%`);
        conditions.push(`shipping->>'company' ILIKE $${params.length}`);
      } else if (t.toLowerCase().startsWith('shipping:')) {
        const val = t.replace(/^shipping:/i, '').trim();
        params.push(`%${val.toLowerCase()}%`);
        conditions.push(`shipping->>'shipping_method' ILIKE $${params.length}`);
      } else {
        // fallback free-text search
        freeText.push(t);
      }
    });

    if (freeText.length > 0) {
      const textSearch = freeText.join(' ').trim();
      if (textSearch) {
        params.push(`%${textSearch.toLowerCase()}%`);
        conditions.push(`
          (
            CAST(order_id AS TEXT) ILIKE $${params.length}
            OR EXISTS (
              SELECT 1
              FROM jsonb_array_elements(line_items) li
              WHERE li->>'sku'  ILIKE $${params.length}
                 OR li->>'name' ILIKE $${params.length}
            )
            OR customer->>'email' ILIKE $${params.length}
            OR shipping->>'company' ILIKE $${params.length}
            OR (COALESCE(customer->>'first_name','') || ' ' || COALESCE(customer->>'last_name',''))
               ILIKE $${params.length}

            OR customer->>'company' ILIKE $${params.length}
            OR shipping->>'shipping_method' ILIKE $${params.length}
          )
        `);
      }
    }
  }

  return { conditions, params };
}

// -----------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------

router.post('/order-updated', async (req, res) => {
  try {
    const orderId = req.body?.data?.id;
    if (!orderId) {
      console.log('No order id provided on webhook payload');
      return res.status(400).json({ success: false, message: 'No order id' });
    }

    await updateOrder(orderId, 'htw');
    return res.status(200).json({ success: true, message: 'Order sync scheduled' });
  } catch (err) {
    console.error('Error handling order-updated webhook:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
router.post('/sff-order-updated', async (req, res) => {
  try {
    const orderId = req.body?.data?.id;
    if (!orderId) {
      console.log('No order id provided on webhook payload');
      return res.status(400).json({ success: false, message: 'No order id' });
    }

    await updateOrder(orderId, 'sff');
    return res.status(200).json({ success: true, message: 'Order sync scheduled' });
  } catch (err) {
    console.error('Error handling order-updated webhook:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/status-updated', async (req, res) => {
  try {
    const orderId = req.body?.data?.id;
    if (!orderId) {
      console.log('No order id provided on webhook payload');
      return res.status(400).json({ success: false, message: 'No order id' });
    }
    const { new_status_id, previous_status_id } = req.body?.data.status || {};
    const newStatus = STATUS_MAP[new_status_id] || 'Unknown';
    const prevStatus = STATUS_MAP[previous_status_id] || 'Unknown';

    if (prevStatus === 'Incomplete') {
      return res
        .status(200)
        .json({ success: true, message: 'Ignored Incomplete → X status change' });
    }

    await updateOrderStatus(orderId, newStatus, 'htw');
  } catch (err) {
    console.error('Error handling status-updated webhook:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/sff-status-updated', async (req, res) => {
  try {
    const orderId = req.body?.data?.id;
    if (!orderId) {
      console.log('No order id provided on webhook payload');
      return res.status(400).json({ success: false, message: 'No order id' });
    }
    const { new_status_id, previous_status_id } = req.body?.data.status || {};
    const newStatus = STATUS_MAP[new_status_id] || 'Unknown';
    const prevStatus = STATUS_MAP[previous_status_id] || 'Unknown';

    if (prevStatus === 'Incomplete') {
      return res
        .status(200)
        .json({ success: true, message: 'Ignored Incomplete → X status change' });
    }

    await updateOrderStatus(orderId, newStatus, 'sff');
  } catch (err) {
    console.error('Error handling status-updated webhook:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/create-order', (req, res) => {
  const orderID = req.body?.data?.id;
  if (!orderID) {
    console.error('No order id provided on webhook payload');
    return res.status(400).json({ success: false, message: 'No order id' });
  }

  // Debounce + delay this specific order
  scheduleOrderProcess(orderID, 'htw');
  return res.status(200).json({ success: true, message: 'Order sync scheduled' });
});

router.post('/sff-create-order', (req, res) => {
  const orderID = req.body?.data?.id;
  if (!orderID) {
    console.error('No order id provided on webhook payload');
    return res.status(400).json({ success: false, message: 'No order id' });
  }

  // Debounce + delay this specific order
  scheduleOrderProcess(orderID, 'sff');
  return res.status(200).json({ success: true, message: 'Order sync scheduled' });
});

router.post('/sync', async (req, res) => {
  try {
    const storeKey = req.body.storeKey;
    const out = await syncOrders(storeKey);
    return res.status(200).json(out);
  } catch (err) {
    console.error('Error syncing orders:', err);
    return res.status(500).json({ success: false, message: 'Error syncing orders' });
  }
});

router.post('/split', async (req, res) => {
  const client = await pool.connect();
  try {
    const { orderId, shipments, storeKey } = req.body;
    console.log(storeKey);

    // 1. Fetch original order once
    const foundOrder = await client.query(
      `SELECT * FROM ${DATABASE_MAP[storeKey]} WHERE order_id = $1 AND (shipment_number IS NULL OR shipment_number = 0)`,
      [orderId]
    );
    if (foundOrder.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const originalOrder = foundOrder.rows[0];

    // ✅ Ensure JSON is parsed
    // ✅ Step 1: Normalize line_items into an array
    let lineItems;
    try {
      if (Array.isArray(originalOrder.line_items)) {
        lineItems = originalOrder.line_items;
      } else if (typeof originalOrder.line_items === 'string') {
        lineItems = JSON.parse(originalOrder.line_items);
      } else if (originalOrder.line_items && typeof originalOrder.line_items === 'object') {
        // pg may already give parsed JSON if you use json/jsonb column
        lineItems = originalOrder.line_items;
      } else {
        lineItems = [];
      }
    } catch (e) {
      console.error('❌ Failed to parse line_items:', originalOrder.line_items, e);
      lineItems = [];
    }

    const results = [];
    await client.query('BEGIN');

    for (let i = 0; i < shipments.length; i++) {
      const shipment = shipments[i];

      // Normalize both sets of IDs to strings for comparison
      const shipmentItems = lineItems.filter((li) =>
        shipment.items.map(String).includes(String(li.id))
      );

      if (!shipmentItems.length) {
        console.warn(`⚠️ No matching items found for shipment ${shipment.id}`);
      }

      if (i === 0) {
        // Update the existing base row for first shipment
        const updated = await client.query(
          `
          UPDATE ${DATABASE_MAP[storeKey]}
          SET line_items = $1,
              shipment_number = $2,
              is_split = true,
              total_shipments = $3
          WHERE id = $4
          RETURNING *;
        `,
          [JSON.stringify(shipmentItems), shipment.id, shipments.length, originalOrder.id]
        );
        results.push(updated.rows[0]);
      } else {
        // Insert fresh duplicates for subsequent shipments
        const duplicated = await client.query(
          `
          INSERT INTO ${DATABASE_MAP[storeKey]} (
          order_id, customer, shipping, status, total_items, grand_total,
          created_at, is_printed, printed_time, line_items, shipment_number,
          is_split, total_shipments
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13)
        RETURNING *;
        `,
          [
            originalOrder.order_id,
            originalOrder.customer,
            originalOrder.shipping,
            originalOrder.status,
            originalOrder.total_items,
            originalOrder.grand_total,
            originalOrder.created_at,
            originalOrder.is_printed,
            originalOrder.printed_time,
            JSON.stringify(shipmentItems),
            shipment.id,
            true, // is_split
            shipments.length, // total shipments
          ]
        );
        results.push(duplicated.rows[0]);
      }
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Order split successfully',
      orders: results,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error splitting order:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to split order', error: err.message });
  } finally {
    client.release();
  }
});

router.post('/merge', async (req, res) => {
  const client = await pool.connect();
  try {
    const { orderId, shipments, storeKey } = req.body;

    if (!orderId || !Array.isArray(shipments) || shipments.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. Must supply orderId and at least two shipments.',
      });
    }

    // 1. Get all the shipments for this order
    const { rows: foundShipments } = await client.query(
      `SELECT * FROM ${DATABASE_MAP[storeKey]}
       WHERE order_id = $1 AND shipment_number = ANY($2::int[])
       ORDER BY shipment_number ASC`,
      [orderId, shipments]
    );

    if (foundShipments.length < 2) {
      return res
        .status(404)
        .json({ success: false, message: 'Not enough shipments found to merge.' });
    }

    // 2. Merge line items
    let mergedLineItems = [];
    foundShipments.forEach((order) => {
      const items = Array.isArray(order.line_items)
        ? order.line_items
        : JSON.parse(order.line_items || '[]');
      mergedLineItems = [...mergedLineItems, ...items];
    });

    // 3. Pick the "primary" shipment (smallest shipment_number)
    const primary = foundShipments[0];
    const otherIds = foundShipments.slice(1).map((o) => o.id);

    await client.query('BEGIN');

    // 4. Update the primary shipment with merged line items
    const { rows: updatedOrder } = await client.query(
      `UPDATE ${DATABASE_MAP[storeKey]}
       SET line_items = $1::jsonb,
           shipment_number = 0,
            is_split = false,
            total_shipments = 1
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(mergedLineItems), primary.id]
    );

    // 5. Delete the other split shipments
    if (otherIds.length > 0) {
      await client.query(`DELETE FROM ${DATABASE_MAP[storeKey]} WHERE id = ANY($1::uuid[])`, [
        otherIds,
      ]);
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Shipments merged successfully',
      order: updatedOrder[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error merging orders:', err);
    return res.status(500).json({ success: false, message: 'Failed to merge orders' });
  } finally {
    client.release();
  }
});

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const offset = (page - 1) * limit;
    const filter = req.query.filter || 'all';
    const search = req.query.search ? req.query.search.trim() : null;
    const sort = req.query.sort || 'created_at_desc';
    const storeKey = req.query.storeKey;

    const { conditions, params } = handleSearch(search);

    // --- Filters ---
    if (filter === 'printed') {
      conditions.push('is_printed = true');
    } else if (filter === 'not-printed') {
      conditions.push('is_printed = false');
    } else if (filter === 'split') {
      conditions.push('is_split = true');
    } else if (filter === 'dropship') {
      conditions.push(`
        EXISTS (
          SELECT 1
          FROM jsonb_array_elements(line_items) li
          WHERE COALESCE(li->>'is_dropship','false')::boolean = true
        )
      `);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // --- Sorting ---
    let orderBy = 'created_at DESC';
    switch (sort.toLowerCase()) {
      case 'created_at_asc':
      case 'age_asc':
        orderBy = 'created_at ASC';
        break;
      case 'created_at_desc':
      case 'age_desc':
        orderBy = 'created_at DESC';
        break;
      case 'order_id_asc':
        orderBy = 'order_id ASC';
        break;
      case 'order_id_desc':
        orderBy = 'order_id DESC';
        break;
      case 'pick_list_complete_asc':
        orderBy = 'pick_list_complete ASC';
        break;
      case 'pick_list_complete_desc':
        orderBy = 'pick_list_complete DESC';
        break;
    }

    // --- Params ---
    const countParams = [...params];
    const dataParams = [...params, parseInt(limit, 10), parseInt(offset, 10)];

    const dataQuery = `
      WITH filtered AS (
        SELECT *
        FROM ${DATABASE_MAP[storeKey]}
        ${whereClause}
      )
      SELECT *
      FROM filtered
      ORDER BY ${orderBy}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const countQuery = `
      WITH filtered AS (
        SELECT *
        FROM ${DATABASE_MAP[storeKey]}
        ${whereClause}
      )
      SELECT COUNT(*) FROM filtered
    `;

    // --- Execute ---
    const totalResult = await pool.query(countQuery, countParams);
    const totalOrders = parseInt(totalResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalOrders / limit);
    const result = await pool.query(dataQuery, dataParams);

    return res.status(200).json({
      orders: result.rows,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

router.get('/tags', async (req, res) => {
  try {
    const storeKey = req.body.storeKey || null;
    const result = await pool.query('SELECT * FROM order_tags ORDER BY name');
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching order tags:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch order tags' });
  }
});

router.delete('/', async (req, res) => {
  const { orderIds, storeKey } = req.body;
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ success: false, message: 'An array of order IDs is required' });
  }

  try {
    const placeholders = orderIds.map((_, i) => `$${i + 1}`).join(', ');
    const deleteQuery = `DELETE FROM ${DATABASE_MAP[storeKey]} WHERE order_id IN (${placeholders}) RETURNING order_id`;
    const deleteResult = await pool.query(deleteQuery, orderIds);
    const deletedIds = deleteResult.rows.map((row) => row.order_id);

    if (deletedIds.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders found to delete' });
    }

    const insertPlaceholders = deletedIds.map((_, i) => `($${i + 1})`).join(', ');
    const insertQuery = `INSERT INTO ${DELETED_IDS_DB_MAP[storeKey]} (order_id) VALUES ${insertPlaceholders} ON CONFLICT DO NOTHING`;
    await pool.query(insertQuery, deletedIds);

    return res.status(200).json({
      success: true,
      message: `${deletedIds.length} order(s) deleted successfully`,
      deleted: deletedIds,
    });
  } catch (err) {
    console.error('Error deleting orders:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete orders' });
  }
});

router.put('/mark-printed', async (req, res) => {
  const { orderIds, storeKey } = req.body;
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ message: 'orderIds must be a non-empty array' });
  }
  try {
    await pool.query(
      `
      UPDATE ${DATABASE_MAP[storeKey]}
      SET is_printed = true,
          printed_time = now()
      WHERE order_id = ANY($1::int[])
      `,
      [orderIds]
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error updating printed orders:', err);
    return res.status(500).json({ success: false, message: 'Failed to update orders' });
  }
});

router.post('/generate-pdf', async (req, res) => {
  try {
    const { html } = req.body;
    if (!html) return res.status(400).send('Missing HTML');

    const file = { content: html };
    const options = { format: 'A4' };
    const pdfBuffer = await pdf.generatePdf(file, options);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="print.pdf"',
      'Content-Length': pdfBuffer.length,
    });
    return res.end(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    return res.status(500).send('Failed to generate PDF');
  }
});

router.post('/add', async (req, res) => {
  try {
    const { orderId, storeKey } = req.body;
    if (!orderId) {
      console.error('No order id provided in request body');
      return res.status(400).json({ success: false, message: 'No order id' });
    }

    const existing = await pool.query(
      `SELECT id FROM ${DATABASE_MAP[storeKey]} WHERE order_id = $1`,
      [orderId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: `Order ${orderId} already exists` });
    }

    // Process immediately (no delay)
    await processSingleOrder(orderId, storeKey, true);

    return res.status(200).json({ success: true, message: 'Order processing initiated' });
  } catch (err) {
    console.error('Error adding order:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
