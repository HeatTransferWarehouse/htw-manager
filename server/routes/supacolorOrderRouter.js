
const express = require('express');
const app = express();
const pool = require('../modules/pool');
const router = express.Router();
const axios = require("axios");

const { Logtail } = require("@logtail/node");
const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

router.post('/', function (req, res) {
 
    logtail.info(`Supacolor API hit via webhook: ${req.body}`);
    // respond with 200 OK

    console.log(req.body);

    res.send("it werked");
});

module.exports = router;