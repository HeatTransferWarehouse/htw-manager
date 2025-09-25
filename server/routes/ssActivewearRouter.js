require('dotenv').config();
const express = require('express');
const router = express.Router();
// S&S Activewear API Documentation: https://api.ssactivewear.com/V2/

// Helper Function to fetch from the SS Activewear Rest API
const SSApiFetch = async (method, endpoint, params = null) => {
  try {
    // Construct the full URL with parameters if provided
    const cleanedParams = params
      ? '?' +
        Object.entries(params)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')
      : '';

    const url = `${process.env.SS_ACTIVEWEAR_BASE_URL}${endpoint}/${cleanedParams}`;

    // Basic Auth setup
    const auth = Buffer.from(
      `${process.env.SS_ACTIVEWEAR_ACCOUNT_ID}:${process.env.SS_ACTIVEWEAR_API_KEY}`
    ).toString('base64');

    const options = {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`SS API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (err) {
    console.error('Error in SSApiFetch:', err);
  }
};

module.exports = router;
