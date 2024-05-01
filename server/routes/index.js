require("dotenv").config();
const express = require("express");
const router = express.Router();

const { getBPOrderId } = require("./Capture/brightpearl");

router.post("/bp-tracking", async (req, res) => {
  if (req.body.data && req.body.data.status.new_status_id === 2) {
    const orderId = req.body.data.id;
    console.log("Order ID: ", orderId);
    getBPOrderId(orderId);
  } else {
    console.log("No shipped status found.");
    res.sendStatus(400);
  }
});

module.exports = router;
