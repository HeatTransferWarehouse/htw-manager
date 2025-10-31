require('dotenv').config();
const express = require('express');
const router = express.Router();
const pool = require('../../../modules/pool');

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

const fetchGraphQL = async (query) => {
  const token = await getValidApiToken('htw');
  const url = `https://store-${process.env.STORE_HASH}-1.mybigcommerce.com/graphql`;

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

const fetchJSON = async (url, options = {}) => {
  if (!url) return undefined; // early return if url is missing

  try {
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
      // swallow the error and just return undefined
      return undefined;
    }

    return await resp.json().catch(() => undefined);
  } catch {
    return undefined; // catch network/other errors
  }
};

async function fetchProductWithWeights() {
  const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v3/catalog/products?include_fields=weight&weight=1&limit=250`;

  try {
    const products = await fetchJSON(url);
    console.log(products);
  } catch (error) {
    console.error('Error fetching products with weights:', error);
  }
}

module.exports = router;
