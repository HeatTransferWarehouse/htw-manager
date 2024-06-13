require("dotenv").config();
const express = require("express");
const router = express.Router();

const { getBPOrderId } = require("./Capture/brightpearl");

router.post("/bp-tracking", async (req, res) => {
  if (req.body.data && req.body.data.status.new_status_id === 2) {
    const orderId = req.body.data.id;
    getBPOrderId(orderId);
  }
});

module.exports = router;
