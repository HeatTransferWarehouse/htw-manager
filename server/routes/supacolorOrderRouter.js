
const express = require('express');
const app = express();
const pool = require('../modules/pool');
const router = express.Router();
const axios = require("axios");

const { Logtail } = require("@logtail/node");
const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

router.post('/', function (req, res) {

    // Logging
    logtail.info(`Supacolor API hit via webhook: ${req.body}`);
    console.log('Product edited: ', req.body);
    res.send("it werked");
});

router.post('/create-order', function (req, res) {

    // Here we will get the id of the order that gets placed. May do more depending on how much info
    // we get from the webhook.

    // Logging
    logtail.info(`Supacolor create order API hit via webhook: ${req.body}`);
    console.log('Order placed: ', req.body);
    res.send("create order werked");
});

module.exports = router;