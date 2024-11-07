require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();
const pool = require("../modules/pool");

router.get("/get/webhooks", async (req, res) => {
  try {
    let url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v3/hooks`;
    let options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": process.env.BG_AUTH_TOKEN,
      },
    };
    const response = await axios.get(url, options);

    const cleanedData = response.data.data.map((webhook) => {
      return {
        id: webhook.id,
        scope: webhook.scope,
        destination: webhook.destination,
        is_active: webhook.is_active,
        events_history_enabled: webhook.events_history_enabled,
        headers: webhook.headers,
      };
    });

    return res.send(cleanedData);
  } catch (error) {
    console.log("Error getting Webhooks", error);
  }
});

router.delete("/delete/webhook/:id", async (req, res) => {
  try {
    let url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v3/hooks/${req.params.id}`;
    let options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": process.env.BG_AUTH_TOKEN,
      },
    };
    await axios.delete(url, options);

    return res.sendStatus(200);
  } catch (error) {
    console.log("Error deleting Webhook", error);
  }
});

router.put("/update/webhook/:id", async (req, res) => {
  const { scope, destination, is_active, events_history_enabled, headers } =
    req.body;
  try {
    const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v3/hooks/${req.params.id}`;
    const data = {
      scope: scope,
      destination: destination,
      is_active: is_active,
      events_history_enabled: events_history_enabled,
      headers: headers,
    };
    const config = {
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": process.env.BG_AUTH_TOKEN,
      },
    };

    await axios.put(url, data, config);

    return res.sendStatus(200);
  } catch (error) {
    console.log("Error updating Webhook", error);
    return res.status(500).send("Error updating Webhook");
  }
});

router.post("/create/webhook", async (req, res) => {
  const { scope, destination, is_active, events_history_enabled, headers } =
    req.body;

  try {
    const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v3/hooks`;
    const data = {
      scope: scope,
      destination: destination,
      is_active: is_active,
      events_history_enabled: events_history_enabled,
      headers: headers,
    };
    const config = {
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": process.env.BG_AUTH_TOKEN,
      },
    };

    await axios.post(url, data, config);

    return res.sendStatus(200);
  } catch (error) {
    console.log("Error adding Webhook", error);
    return res.status(500).send("Error adding Webhook");
  }
});

module.exports = router;
