require('dotenv').config();
const express = require('express');
const axios = require('axios');
const router = express.Router();

console.log('SSActivewear API routes loaded');

const username = process.env.SS_ACTIVEWEAR_USERNAME; // Account Number
const password = process.env.SS_ACTIVEWEAR_API_KEY; // API Key

const basicAuthToken = Buffer.from(`${username}:${password}`).toString('base64');

const ssConfig = {
  baseURL: process.env.SS_ACTIVEWEAR_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Basic ${basicAuthToken}`,
  },
};

const getProducts = async () => {
  try {
    const response = await axios.get('/products/', ssConfig);
    console.log(response);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    throw error;
  }
};

module.exports = router;
