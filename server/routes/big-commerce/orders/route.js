// routes/big-commerce/orders/route.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const pool = require('../../../modules/pool');
const pdf = require('html-pdf-node');

const sseClients = new Set();

function sseEmit(event, payload) {
  const msg = `event: ${event}\n` + `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(msg);
    } catch (_) {}
  }
}

// keep alive so proxies don’t close the stream
setInterval(() => sseEmit('ping', { t: Date.now() }), 25000);

// ----------------------------- Config ----------------------------------

const ALLOWED_STATUSES = new Set(['Awaiting Fulfillment', 'Awaiting Payment']);

// Webhook delay/debounce: give BigCommerce time to flip out of "Incomplete"
const PENDING_TIMERS = new Map(); // order_id -> timeout
const DELAY_MS = 5_000; // initial delay after webhook
const MAX_RETRIES = 3; // how many times to recheck if still Incomplete
const BACKOFF_MS = 15_000; // wait between retries

// Sync concurrency + pagination
const SYNC_TARGET = 50; // aim to add up to 50 valid orders
const SYNC_CONCURRENCY = 8; // parallel workers for product fetch + insert
const SYNC_PAGE_SIZE = 50;

// -----------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------

const fetchJSON = async (url, options = {}) => {
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Auth-Token': process.env.BG_AUTH_TOKEN,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ...options,
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Fetch failed ${resp.status}: ${text || resp.statusText}`);
  }
  return resp.json();
};

const runWithConcurrencyLimit = async (tasks, limit) => {
  const results = new Array(tasks.length);
  let idx = 0;

  const worker = async () => {
    while (idx < tasks.length) {
      const myIdx = idx++;
      try {
        results[myIdx] = await tasks[myIdx]();
      } catch (e) {
        console.error('Task error:', e);
        results[myIdx] = null;
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
};

// -----------------------------------------------------------------------
// BigCommerce helpers
// -----------------------------------------------------------------------

const getProductsOnOrder = async (url) => {
  return fetchJSON(url);
};

const getOrderData = async (orderID) => {
  const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders/${orderID}?include=consignments`;
  const order = await fetchJSON(url);

  // Guard: structure may vary if no consignments yet
  const cons = order.consignments?.[0]?.shipping?.[0] || {};

  const products = await getProductsOnOrder(order.products.url);

  return {
    order_id: order.id,
    date_created: order.date_created, // BigCommerce date string, e.g. "Tue, 19 Aug 2025 18:52:56 +0000"
    line_items: products.map((p) => ({
      id: p.id,
      order_id: order.id,
      name: p.name,
      sku: p.sku,
      quantity: p.quantity,
      price: p.total_inc_tax,
      options: (p.product_options || []).map((opt) => ({
        display_name: opt.display_name,
        display_value: opt.display_value,
      })),
    })),
    shipping: {
      shipping_method: cons.shipping_method,
      cost_inc_tax: cons.cost_inc_tax,
      street_1: cons.street_1,
      street_2: cons.street_2,
      city: cons.city,
      state: cons.state,
      zip: cons.zip,
      country: cons.country,
    },
    customer: {
      first_name: order.billing_address?.first_name,
      last_name: order.billing_address?.last_name,
      email: order.billing_address?.email,
      phone: order.billing_address?.phone,
    },
    subtotal: order.subtotal_ex_tax,
    tax: order.total_tax,
    grand_total: order.total_inc_tax,
    total_items: order.items_total,
    status: order.status,
  };
};

// -----------------------------------------------------------------------
// DB
// -----------------------------------------------------------------------

const addOrderToDatabase = async (orderData) => {
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
    } = orderData;

    const existing = await pool.query('SELECT id FROM picklist_orders WHERE order_id = $1', [
      order_id,
    ]);
    if (existing.rows.length > 0) {
      return { success: false, message: 'Order already exists' };
    }

    const result = await pool.query(
      `
      INSERT INTO picklist_orders (
        order_id,
        created_at,
        line_items,
        shipping,
        customer,
        subtotal,
        tax,
        grand_total,
        status,
        total_items
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
      ]
    );

    return { success: true, order: result.rows[0] };
  } catch (err) {
    console.error('Error inserting order:', err);
    return { success: false, message: 'Failed to insert order', error: err };
  }
};

// -----------------------------------------------------------------------
// Per-order delayed processing for webhook
// -----------------------------------------------------------------------

async function processSingleOrder(orderId, attempt = 1) {
  try {
    const data = await getOrderData(orderId);
    if (!data) {
      console.log(`⚪️ Order ${orderId}: no data returned`);
      return;
    }
    const status = (data.status || '').trim();

    if (!ALLOWED_STATUSES.has(status)) {
      if (status === 'Incomplete' && attempt < MAX_RETRIES) {
        console.log(
          `🕒 Order ${orderId} still Incomplete (attempt ${attempt}/${MAX_RETRIES}). Retrying in ${
            BACKOFF_MS / 1000
          }s…`
        );
        setTimeout(() => processSingleOrder(orderId, attempt + 1), BACKOFF_MS);
      } else {
        console.log(`⏭️ Skipping order ${orderId} (status: ${status || 'N/A'})`);
      }
      return;
    }

    const result = await addOrderToDatabase(data);
    if (result?.success) {
      console.log(`✅ Order ${orderId} added`);
    } else {
      console.log(`⚠️ Order ${orderId} not added: ${result?.message || 'unknown error'}`);
    }
  } catch (e) {
    console.error(`❌ Error processing order ${orderId}:`, e);
  }
}

function scheduleOrderProcess(orderId, delayMs = DELAY_MS) {
  console.log(`⏳ Scheduling order ${orderId} processing in ${delayMs / 1000}s`);

  const existing = PENDING_TIMERS.get(orderId);
  if (existing) clearTimeout(existing);

  const t = setTimeout(() => {
    PENDING_TIMERS.delete(orderId);
    processSingleOrder(orderId);
  }, delayMs);

  PENDING_TIMERS.set(orderId, t);
}

// -----------------------------------------------------------------------
// Full sync (paginated + concurrent)
// -----------------------------------------------------------------------

async function syncOrders() {
  let page = 1;
  let added = 0;
  let skippedIncomplete = 0;
  const results = [];

  while (added < SYNC_TARGET) {
    const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders?limit=${SYNC_PAGE_SIZE}&page=${page}&sort=date_created:desc&include=consignments`;
    const orders = await fetchJSON(url);
    if (!orders.length) break;

    // Build tasks for this page
    const tasks = [];
    for (const o of orders) {
      const status = (o.status || '').trim();
      if (!ALLOWED_STATUSES.has(status)) {
        if (status === 'Incomplete') skippedIncomplete++;
        continue;
      }

      tasks.push(async () => {
        try {
          const products = await getProductsOnOrder(o.products.url);
          const cons = o.consignments?.[0]?.shipping?.[0] || {};
          const orderData = {
            order_id: o.id,
            date_created: o.date_created,
            line_items: products.map((p) => ({
              id: p.id,
              order_id: o.id,
              name: p.name,
              sku: p.sku,
              quantity: p.quantity,
              price: p.total_inc_tax,
              options: (p.product_options || []).map((opt) => ({
                display_name: opt.display_name,
                display_value: opt.display_value,
              })),
            })),
            shipping: {
              shipping_method: cons.shipping_method,
              cost_inc_tax: cons.cost_inc_tax,
              street_1: cons.street_1,
              street_2: cons.street_2,
              city: cons.city,
              state: cons.state,
              zip: cons.zip,
              country: cons.country,
            },
            customer: {
              first_name: o.billing_address?.first_name,
              last_name: o.billing_address?.last_name,
              email: o.billing_address?.email,
              phone: o.billing_address?.phone,
            },
            subtotal: o.subtotal_ex_tax,
            tax: o.total_tax,
            grand_total: o.total_inc_tax,
            total_items: o.items_total,
            status: status || 'Awaiting Fulfillment',
          };

          const out = await addOrderToDatabase(orderData);
          if (out?.success) {
            return out.order;
          }
          return null;
        } catch (e) {
          console.error(`Task failed for order ${o.id}:`, e.message || e);
          return null;
        }
      });
    }

    if (tasks.length) {
      const pageResults = await runWithConcurrencyLimit(tasks, SYNC_CONCURRENCY);
      const addedNow = pageResults.filter(Boolean);
      results.push(...addedNow);
      added += addedNow.length;
    }

    if (orders.length < SYNC_PAGE_SIZE) break; // no more pages
    page++;
  }

  return { success: true, added, skipped_incomplete: skippedIncomplete, results };
}

// -----------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------

router.post('/create-order', (req, res) => {
  const orderID = req.body?.data?.id;
  if (!orderID) {
    console.error('No order id provided on webhook payload');
    return res.status(400).json({ success: false, message: 'No order id' });
  }

  // Debounce + delay this specific order
  scheduleOrderProcess(orderID);
  return res.status(200).json({ success: true, message: 'Order sync scheduled' });
});

router.post('/sync', async (req, res) => {
  try {
    const out = await syncOrders();
    return res.status(200).json(out);
  } catch (err) {
    console.error('Error syncing orders:', err);
    return res.status(500).json({ success: false, message: 'Error syncing orders' });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM picklist_orders ORDER BY created_at DESC');
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

router.get('/tags', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM order_tags ORDER BY name');
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching order tags:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch order tags' });
  }
});

router.delete('/', async (req, res) => {
  const orderIds = req.body.orderIds;
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ success: false, message: 'An array of order IDs is required' });
  }

  try {
    const placeholders = orderIds.map((_, i) => `$${i + 1}`).join(', ');
    const deleteQuery = `DELETE FROM picklist_orders WHERE order_id IN (${placeholders}) RETURNING order_id`;
    const deleteResult = await pool.query(deleteQuery, orderIds);
    const deletedIds = deleteResult.rows.map((row) => row.order_id);

    if (deletedIds.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders found to delete' });
    }

    const insertPlaceholders = deletedIds.map((_, i) => `($${i + 1})`).join(', ');
    const insertQuery = `INSERT INTO deleted_order_ids (order_id) VALUES ${insertPlaceholders} ON CONFLICT DO NOTHING`;
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
  const { orderIds } = req.body;
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ message: 'orderIds must be a non-empty array' });
  }
  try {
    await pool.query(
      `
      UPDATE picklist_orders
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

// subscribe to events (SSE)
router.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  // if you use compression middleware globally, disable it for this route:
  // res.flushHeaders?.(); // ok to call if you have it

  res.write('\n'); // open the stream
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

module.exports = router;
