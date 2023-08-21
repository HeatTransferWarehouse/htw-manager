
const express = require('express');
const app = express();
const pool = require('../modules/pool');
const router = express.Router();
const axios = require("axios");

const { Logtail } = require("@logtail/node");
const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

router.post('/', function (req, res) {
 
    logtail.info('Supacolor endpoint hit via webhook :)');
    // respond with 200 OK
    res.send('YAY IT WORKS :)');
});

module.exports = router;