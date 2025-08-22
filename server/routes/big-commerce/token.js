require('dotenv').config();
const express = require('express');
const router = express.Router();

// -----------------------------------------------------------------------------
// Store Map Configuration
// -----------------------------------------------------------------------------
// Each store entry contains:
//   - hash: Unique store hash from BigCommerce
//   - token: API access token for server-to-server authentication
// The key (sandbox, htw, sff) is used to identify which store's credentials
// should be used when requesting a Storefront API token.
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

// -----------------------------------------------------------------------------
// GET /api/big-commerce/token
// -----------------------------------------------------------------------------
// Generates a short-lived BigCommerce Storefront API token.
//
// Query Parameters:
//   store (optional): The store key from storeMap (e.g., "htw", "sandbox", "sff").
//                     Defaults to "htw" if not provided.
//
// Response:
//   { token: string, expiry: number }
//
//   - token:  The short-lived Storefront API token
//   - expiry: The token's expiration time in **milliseconds** (Unix timestamp)
// -----------------------------------------------------------------------------
router.get('/', async (req, res) => {
  const storeKey = req.query.store || 'htw'; // Default to "htw"
  const store = storeMap[storeKey];

  // Validate requested store
  if (!store) {
    return res.status(400).json({ error: `Invalid store specified: ${storeKey}` });
  }

  // Storefront tokens typically expire in 30 minutes, so request one that
  // expires in ~30 minutes from now.
  const expiresAtUnix = Math.floor(Date.now() / 1000) + 1800; // seconds

  // BigCommerce endpoint for creating Storefront API tokens
  // https://developer.bigcommerce.com/docs/rest-authentication/tokens
  const url = `https://api.bigcommerce.com/stores/${store.hash}/v3/storefront/api-token`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': store.token, // Server-side API token (from storeMap)
      },
      body: JSON.stringify({
        channel_id: 1, // Channel ID (usually 1 for default storefront)
        expires_at: expiresAtUnix,
      }),
    });

    // Parse the JSON response body
    const json = await response.json();

    // Check if the token was successfully returned
    if (!json.data?.token) {
      console.error('BigCommerce token response:', json);
      return res
        .status(500)
        .json({ error: `Failed to retrieve token from BigCommerce for ${storeKey}` });
    }

    // Construct token response
    const tokenData = {
      token: json.data.token,
      expiry: expiresAtUnix * 1000, // convert seconds -> ms
    };

    // Send the token data back to the client
    return res.json(tokenData);
  } catch (err) {
    console.error(`Error fetching API token for store "${storeKey}":`, err);
    return res.status(500).json({ error: 'Internal server error fetching token' });
  }
});

module.exports = router;
