const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { google } = require('googleapis');
const express = require('express');
const router = express.Router();

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

function decodeBase64Env(varName) {
  const base64 = process.env[varName];
  if (!base64) throw new Error(`${varName} is not set`);
  return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
}

const CHUNK_SIZE = 300; // You can adjust this size as needed
const MAX_SKUS_TO_PROCESS = 10;

let currentAPIToken = null;
let currentAPITokenExpiry = null;
let grandTotalVariantUpdates = 0; // 👈 Add this line at the top of startBigCommercePriceSync

const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const getApiToken = async () => {
  try {
    const expiresAtUnix = Math.floor(Date.now() / 1000) + 1800;

    const url = `https://api.bigcommerce.com/stores/${process.env.SFF_STORE_HASH}/v3/storefront/api-token`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': process.env.SFF_AUTH_TOKEN,
      },
      body: JSON.stringify({
        channel_id: 1, // Adjust this if you're using a different storefront channel
        expires_at: expiresAtUnix,
      }),
    });

    const json = await response.json();

    if (!json.data || !json.data.token) {
      throw new Error('Failed to retrieve token from BigCommerce API');
    }

    currentAPIToken = json.data.token;
    currentAPITokenExpiry = expiresAtUnix * 1000; // convert to ms for Date.now() comparisons
  } catch (err) {
    console.error('Error fetching API token:', err);
    throw err;
  }
};

const getValidApiToken = async () => {
  const bufferTime = 60 * 1000; // refresh 1 minute early
  const isExpired = !currentAPIToken || Date.now() >= currentAPITokenExpiry - bufferTime;

  if (isExpired) {
    await getApiToken();
  }

  return currentAPIToken;
};

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  const credentials = decodeBase64Env('GOOGLE_CREDENTIALS_BASE64');
  const tokens = decodeBase64Env('GOOGLE_TOKENS_BASE64');

  const key = credentials.installed || credentials.web;

  const client = new google.auth.OAuth2(
    key.client_id,
    key.client_secret,
    key.redirect_uris?.[0] || 'http://localhost'
  );

  client.setCredentials(tokens);

  return client;
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function listMajors(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1AtZAcdwbi7N86PjKTXqe27itp8ob2PcQEUHmp8xi6yA',
    range: 'Sheet1!A2:K', // all rows with data
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return [];
  }

  return rows.map((row, index) => ({
    sku: row[0] || '',
    size: row[5] || '',
    price: row[10] || '',
    _rowIndex: index,
  }));
}

const startBigCommercePriceSync = async () => {
  const auth = await authorize();
  const START_ROW = 2;
  const allRows = (await listMajors(auth)).slice(START_ROW);

  if (allRows.length === 0) {
    console.log('No rows found.');
    return;
  }

  console.log(`📄 Found ${allRows.length} rows from Google Sheet.`);

  // 1. Group rows by SKU
  const skuMap = new Map();
  for (const row of allRows) {
    const sku = row.sku;
    if (!sku) continue;
    if (!skuMap.has(sku)) {
      skuMap.set(sku, []);
    }
    skuMap.get(sku).push(row);
  }

  // ⏱ Track time
  const syncStart = Date.now();
  let totalSimulatedChunkCount = 0;

  const entries = Array.from(skuMap.entries());

  // 2. Process each SKU's rows separately
  let count = 1;
  for (const [sku, rows] of entries) {
    console.log(`\n🔄 [${count}/${skuMap.size}] Processing SKU: ${sku} (${rows.length} rows)`);
    const result = await processSheetChunk(rows);
    totalSimulatedChunkCount += Math.ceil((result.done + result.errors) / 50); // count would-be API calls
    grandTotalVariantUpdates += result.done;
    count++;
  }

  const actualDurationMs = Date.now() - syncStart;

  console.log(`\n✅ All SKUs processed.`);
  console.log(`📦 Total variants to update: ${grandTotalVariantUpdates}`);
  console.log(`🕒 Run time: ${(actualDurationMs / 1000).toFixed(2)}s`);
};

// startBigCommercePriceSync();

const expandGroupedSizes = (input) => {
  if (input === '(X)S-(X)L') return ['XS', 'S', 'M', 'L', 'XL'];
  return [input];
};

function normalizeSize(size) {
  const cleaned = size.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  const sizeAliases = {
    '2XL': 'XXL',
    '3XL': 'XXXL',
    '4XL': 'XXXXL',
    'ONE SIZE': 'OSFA',
    ONESIZE: 'OSFA',
    OS: 'OSFA',
    UNI: 'OSFA',
  };

  return sizeAliases[cleaned] || cleaned;
}

function simplifySize(label) {
  const size = normalizeSize(label);

  // Strip known trailing style letters like T, S
  return size.replace(/T$|S$/i, '');
}

function matchVariantSize(targetSize, variantLabel) {
  const target = simplifySize(targetSize);
  const variant = simplifySize(variantLabel);

  return target === variant;
}

async function processSheetChunk(rows) {
  const sku = rows[0].sku;
  const variantData = await getProductVariantData(sku);

  if (!variantData) {
    console.warn(`❌ No product found for SKU: ${sku}. Skipping ${rows.length} rows.`);
    return { done: 0, notFound: rows.length, errors: 0, estimatedTime: 0 };
  }

  const updates = [];
  let notFoundCount = 0;
  let skippedCount = 0;

  for (const row of rows) {
    const { size: groupedSize, price } = row;
    const sizes = expandGroupedSizes(groupedSize);
    let matched = false;

    if (variantData.isSimple) {
      // Product with no variants, update main product price
      updates.push({
        id: variantData.id,
        price: parseFloat(price),
      });
      matched = true;
    } else {
      for (const size of sizes) {
        const variantGroup = variantData.variants.find((v) => matchVariantSize(size, v.size));

        if (!variantGroup) continue;

        matched = true;
        for (const variantId of variantGroup.ids) {
          const variantInfo = variantData.rawVariants.find((v) => v.id === variantId);

          const currentPrice = parseFloat(variantInfo?.price);

          const newPrice = parseFloat(price);

          if (currentPrice !== newPrice) {
            updates.push({ id: variantId, price: newPrice });
          } else {
            skippedCount++;
          }
        }
      }
    }

    if (!matched) {
      notFoundCount++;
    }
  }
  if (skippedCount > 0) {
    console.log(`Skipped ${skippedCount} variants with no price change.`);
  }
  if (updates.length === 0) {
    console.log('No variant updates needed.');
    return { done: 0, notFound: notFoundCount, errors: 0, estimatedTime: 0 };
  }

  const chunks = chunkArray(updates, 50);
  let successCount = 0;
  let errorCount = 0;

  const chunkCount = chunks.length;
  const startTime = Date.now();

  for (let i = 0; i < chunks.length; i++) {
    console.log(`⏳ Updating chunk ${i + 1} of ${chunkCount}`);
    await updateVariantPrice(chunks[i], variantData.rawVariants);
    successCount += chunks[i].length;
  }

  const actualExecutionTime = Date.now() - startTime;

  console.log(`✅ Updates complete for SKU: ${sku}`);
  console.log(`🕒 Run Time: ${(actualExecutionTime / 1000).toFixed(2)}s for ${sku}`);

  return {
    done: successCount,
    notFound: notFoundCount,
    errors: errorCount,
  };
}

const flattenVariants = (variantsResponse) => {
  return variantsResponse.edges.map(({ node }) => {
    const price = node.prices.price.value;
    const id = node.entityId;
    const name = node.name;
    const sku = node.sku;

    const options = node.options.edges.flatMap(({ node }) =>
      node.values.edges.map(({ node }) => node.label)
    );

    return {
      id,
      name,
      price,
      sku, // 👈 include sku for filtering
      options,
    };
  });
};

// startBigCommercePriceSync();

const groupVariantIdsBySize = (variants) => {
  const grouped = {};

  variants.forEach(({ options, id }) => {
    const size = options[1]; // Assuming options[1] is the size
    if (!grouped[size]) {
      grouped[size] = [];
    }
    grouped[size].push(id);
  });

  return grouped;
};

const getProductVariantData = async (sku) => {
  const token = await getValidApiToken();
  const url = `https://store-${process.env.SFF_STORE_HASH}-1.mybigcommerce.com/graphql`;

  const fetchVariants = async (afterCursor = null) => {
    const query = `
      query getProduct($sku: String, $after: String) {
        site {
          product(sku: $sku) {
            name
            entityId
            prices {
              price {
                value
              }
            }
            variants(first: 250, after: $after) {
              pageInfo {
                hasNextPage
                endCursor
              }
              edges {
                node {
                  entityId
                  prices {
                    price {
                      value
                    }
                  }
                  options {
                    edges {
                      node {
                        values {
                          edges {
                            node {
                              label
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          sku,
          after: afterCursor,
        },
      }),
    };

    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');

    const text = await response.text();

    if (!contentType?.includes('application/json')) {
      console.error('❌ BigCommerce API did not return JSON. Raw response:');
      console.error(text);
      throw new Error('BigCommerce API did not return JSON');
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (err) {
      console.error('❌ Failed to parse JSON response:');
      console.error(text);
      throw err;
    }

    if (json.errors) {
      console.error('❌ BigCommerce GraphQL API errors:', json.errors);
      throw new Error(JSON.stringify(json.errors));
    }

    return json.data?.site?.product;
  };

  let product = await fetchVariants();
  if (!product) {
    return null;
  }

  const productName = product.name;
  const productId = product.entityId;
  const productPrice = product.prices?.price?.value;

  const allVariants = [];
  let edges = product.variants?.edges || [];
  let pageInfo = product.variants?.pageInfo;

  allVariants.push(...edges);

  while (pageInfo?.hasNextPage) {
    console.log(`🔍 Fetching next page of variants...`);

    const nextPage = await fetchVariants(pageInfo.endCursor);
    const newEdges = nextPage?.variants?.edges || [];
    allVariants.push(...newEdges);
    pageInfo = nextPage?.variants?.pageInfo;
  }

  if (allVariants.length === 0) {
    return {
      name: productName,
      id: productId,
      isSimple: true,
      price: productPrice,
    };
  }

  const flattened = flattenVariants({ edges: allVariants });

  const grouped = groupVariantIdsBySize(flattened);

  return {
    name: productName,
    id: productId,
    isSimple: false,
    variants: Object.entries(grouped).map(([size, ids]) => ({
      size,
      ids,
    })),
    rawVariants: flattened, // 👈 this is required for price comparisons
  };
};

const updateVariantPrice = async (chunk, rawVariants = []) => {
  let duplicateIdCount = 0;
  let invalidCount = 0;
  let duplicateSkuCount = 0;

  const seenIds = new Set();
  const seenSkus = new Set();

  const idToSku = {};
  rawVariants.forEach((v) => {
    if (v?.id && v?.sku) {
      idToSku[v.id] = v.sku;
    }
  });

  const cleanedChunk = chunk
    .filter((item) => {
      if (!item.id || typeof item.price !== 'number' || isNaN(item.price)) {
        invalidCount++;
        return false;
      }

      const sku = idToSku[item.id];

      if (seenIds.has(item.id)) {
        duplicateIdCount++;
        return false;
      }

      if (sku && seenSkus.has(sku)) {
        duplicateSkuCount++;
        return false;
      }

      seenIds.add(item.id);
      if (sku) seenSkus.add(sku);

      return true;
    })
    .map(({ id, price }) => ({ id, price }));

  if (duplicateIdCount > 0) console.log(`⚠️ Skipped ${duplicateIdCount} duplicate variant IDs`);
  if (duplicateSkuCount > 0)
    console.log(`⚠️ Skipped ${duplicateSkuCount} updates with repeated SKUs in chunk`);
  if (invalidCount > 0) console.log(`⚠️ Skipped ${invalidCount} invalid entries`);

  if (cleanedChunk.length === 0) {
    console.log('⚠️ Skipping chunk: no valid updates after filtering.');
    return false;
  }

  const url = `https://api.bigcommerce.com/stores/${process.env.SFF_STORE_HASH}/v3/catalog/variants`;
  const options = {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Token': process.env.SFF_AUTH_TOKEN,
    },
    body: JSON.stringify(cleanedChunk),
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Error updating variant price: ${response.statusText}\n${text}`);
    }
    console.log('✅ Price updated successfully');
  } catch (error) {
    console.error('❌ Error updating variant price:', error);
  }
};

module.exports = router;
