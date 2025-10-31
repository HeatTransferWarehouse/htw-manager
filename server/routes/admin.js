require('dotenv').config();
const express = require('express');
const axios = require('axios');
const router = express.Router();

if (process.env.SERVER_ENV === 'prod') {
  setInterval(() => getWebHooks('htw'), 60 * 1000);
  setInterval(() => getWebHooks('sff'), 60 * 1000);
  setInterval(() => getWebHooks('sb'), 60 * 1000);
}

const stores = ['htw', 'sff', 'sb'];

const storeMap = {
  sb: {
    hash: process.env.SANDBOX_HASH,
    token: process.env.SANDBOX_API_KEY,
    name: 'Sandbox',
  },
  htw: {
    hash: process.env.STORE_HASH,
    token: process.env.BG_AUTH_TOKEN,
    name: 'Heat Transfer Warehouse',
  },
  sff: {
    hash: process.env.SFF_STORE_HASH,
    token: process.env.SFF_AUTH_TOKEN,
    name: 'Shirts From Fargo',
  },
};

// This function will run every 60 seconds to check if the access token is still valid. If it is not, it will get a new one.
async function getWebHooks(storeKey) {
  const url = `https://api.bigcommerce.com/stores/${storeMap[storeKey].hash}/v3/hooks`;
  const headers = {
    'X-Auth-Token': storeMap[storeKey].token,
  };
  try {
    const response = await axios.get(url, { headers });
    response.data.data.forEach(async (hook) => {
      if (!hook.is_active) {
        await updateWebHooks(hook, storeKey);
      }
    });
  } catch (err) {
    console.log('Error getting webhooks', err);
  }
}

// This function will run every 60 seconds to check if the access token is still valid. If it is not, it will get a new one.
async function updateWebHooks(hook, storeKey) {
  const url = `https://api.bigcommerce.com/stores/${storeMap[storeKey].hash}/v3/hooks/${hook.id}`;
  const headers = {
    'X-Auth-Token': storeMap[storeKey].token,
  };

  // This is the object that will be used to update the webhooks
  const updatedWebHookObject = {
    ...hook,
    is_active: true,
  };
  try {
    await axios.put(url, updatedWebHookObject, { headers });
    console.log(`Webhook ${hook.id} was updated to active`);
  } catch (error) {
    console.log('Error updating webhooks', error);
  }
}

router.get('/get/webhooks', async (req, res) => {
  try {
    const results = await Promise.all(
      stores.map(async (storeKey) => {
        const url = `https://api.bigcommerce.com/stores/${storeMap[storeKey].hash}/v3/hooks`;

        const options = {
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': storeMap[storeKey].token,
          },
        };

        const response = await axios.get(url, options);

        return response.data.data.map((webhook) => ({
          id: webhook.id,
          scope: webhook.scope,
          destination: webhook.destination,
          is_active: webhook.is_active,
          events_history_enabled: webhook.events_history_enabled,
          headers: webhook.headers,
          store: storeMap[storeKey].name,
        }));
      })
    );

    // Flatten the array of arrays
    const cleaned = results.flat();
    return res.json(cleaned);
  } catch (error) {
    console.error('❌ Error getting webhooks:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/delete/webhook/:id', async (req, res) => {
  const { storeKey } = req.body;
  try {
    let url = `https://api.bigcommerce.com/stores/${storeMap[storeKey].hash}/v3/hooks/${req.params.id}`;
    let options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': storeMap[storeKey].token,
      },
    };
    await axios.delete(url, options);

    return res.sendStatus(200);
  } catch (error) {
    console.log('Error deleting Webhook', error);
  }
});

router.put('/update/webhook/:id', async (req, res) => {
  const { scope, destination, is_active, events_history_enabled, headers, storeKey } = req.body;
  try {
    const url = `https://api.bigcommerce.com/stores/${storeMap[storeKey].hash}/v3/hooks/${req.params.id}`;
    const data = {
      scope: scope,
      destination: destination,
      is_active: is_active,
      events_history_enabled: events_history_enabled,
      headers: headers,
    };
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': storeMap[storeKey].token,
      },
    };

    await axios.put(url, data, config);

    return res.sendStatus(200);
  } catch (error) {
    console.log('Error updating Webhook', error);
    return res.status(500).send('Error updating Webhook');
  }
});

router.post('/create/webhook', async (req, res) => {
  const { scope, destination, is_active, events_history_enabled, headers, storeKey } = req.body;

  try {
    const url = `https://api.bigcommerce.com/stores/${storeMap[storeKey].hash}/v3/hooks`;
    const data = {
      scope: scope,
      destination: destination,
      is_active: is_active,
      events_history_enabled: events_history_enabled,
      headers: headers,
    };
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': storeMap[storeKey].token,
      },
    };

    await axios.post(url, data, config);

    return res.sendStatus(200);
  } catch (error) {
    console.log('Error adding Webhook', error);
    return res.status(500).send('Error adding Webhook');
  }
});

module.exports = router;
