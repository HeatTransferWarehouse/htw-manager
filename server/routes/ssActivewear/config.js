require('dotenv').config();

module.exports = {
  ssActivewear: {
    apiUrl: 'https://api.ssactivewear.com',
    accountNumber: process.env.SS_ACCOUNT_NUMBER,
    apiKey: process.env.SS_API_KEY,
    brands: (process.env.SS_BRANDS || '').split(',').map(b => b.trim()).filter(Boolean),
    imageUrlBase: 'https://cdn.ssactivewear.com/'
  },

  bigcommerce: {
    storeHash: process.env.BC_STORE_HASH,
    accessToken: process.env.BC_ACCESS_TOKEN,
    clientId: process.env.BC_CLIENT_ID,
    apiUrl: `https://api.bigcommerce.com/stores/${process.env.BC_STORE_HASH}`
  },

  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
    enabled: process.env.SLACK_ENABLED === 'true'
  },

  sync: {
    schedule: process.env.SYNC_SCHEDULE || '0 0 * * 1,3,5',
    port: process.env.PORT || 3000
  }
};
