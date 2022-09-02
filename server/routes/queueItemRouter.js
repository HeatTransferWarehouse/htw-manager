const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const axios = require("axios");

let config = {
  //authenticate Big Commerce API
  headers: {
    "X-Auth-Client": process.env.BG_AUTH_CLIENT,
    "X-Auth-Token": process.env.BG_AUTH_TOKEN,
  },
};

const { Logtail } = require("@logtail/node");

const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

const {
  //login verification middleware
    rejectUnauthenticated,
  } = require("../modules/authentication-middleware");


router.delete("/deleteitem/:id", rejectUnauthenticated, (req, res) => {
  //deletes new stock orders
  pool
    .query('DELETE FROM "item_queue" WHERE id=$1', [req.params.id])
    .then((result) => {
      res.sendStatus(204); //No Content
    })
    .catch((error) => {
      logtail.info("--DECOQUEUE-- Error DELETE ", error);
      res.sendStatus(500);
    });
});

router.delete("/deletehistory/:id", rejectUnauthenticated, (req, res) => {
  //api to delete conversation history
  pool
    .query('DELETE FROM "history" WHERE id=$1', [req.params.id])
    .then((result) => {
      res.sendStatus(204); //No Content
    })
    .catch((error) => {
      logtail.info("--DECOQUEUE-- Error DELETE ", error);
      res.sendStatus(500);
    });
});

router.delete("/deleteprogress/:id", rejectUnauthenticated, (req, res) => {
  //api to delete stock orders currently in process
  pool
    .query('DELETE FROM "progress" WHERE id=$1', [req.params.id])
    .then((result) => {
      res.sendStatus(204); //No Content
    })
    .catch((error) => {
      logtail.info("--DECOQUEUE-- Error DELETE ", error);
      res.sendStatus(500);
    });
});

router.delete("/deletecomplete/:id", rejectUnauthenticated, (req, res) => {
  //api to delete completed orders
  pool
    .query('DELETE FROM "complete" WHERE id=$1', [req.params.id])
    .then((result) => {
      res.sendStatus(204); //No Content
    })
    .catch((error) => {
      logtail.info("--DECOQUEUE-- Error DELETE ", error);
      res.sendStatus(500);
    });
});

router.put("/run", rejectUnauthenticated, (req, res) => {
  //api to set priority of new stock items
  const { need_to_run, id } = req.body;
  const queryText = 'UPDATE "item_queue" SET need_to_run=$1 WHERE id=$2';

  pool
    .query(queryText, [need_to_run, id])
    .then((result) => {
      res.sendStatus(204); //No Content
    })
    .catch((error) => {
      logtail.info("--DECOQUEUE-- Error UPDATE ", error);
      res.sendStatus(500);
    });
});

router.get("/itemlist", rejectUnauthenticated, (req, res) => {
//gets all of the new stock orders
  const queryText = `SELECT * FROM "item_queue" ORDER BY id DESC;`;
  pool
    .query(queryText)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((error) => {
      logtail.info(`--DECOQUEUE-- Error on item query ${error}`);
      res.sendStatus(500);
    });
});

router.post("/checkhistory", (req, res) => {
  //gets history of the customer that is selected
  let email = req.body.email;
  logtail.info("this is the email", email);
  const queryText =
    `SELECT * from "history" where email=$1;`
  pool
    .query(queryText, [email])
    .then((result) => {
      res.send(result.rows);
    })
    .catch((error) => {
      logtail.info(`--DECOQUEUE-- Error on item query ${error}`);
      res.sendStatus(500);
    });
});

router.get("/itemlistcount", rejectUnauthenticated, (req, res) => {
//gets a total number of new stock items
  const queryText = `SELECT count(*) FROM "item_queue"`;
  pool
    .query(queryText)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((error) => {
      logtail.info(`--DECOQUEUE-- Error on item query ${error}`);
      res.sendStatus(500);
    });
});

router.get("/progresslist", rejectUnauthenticated, (req, res) => {
//gets all of the stock items currently in process
  const queryText = `SELECT * FROM "progress" ORDER BY id DESC;`;
  pool
    .query(queryText)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((error) => {
      logtail.info(`--DECOQUEUE-- Error on item query ${error}`);
      res.sendStatus(500);
    });
});

router.get("/progresslistcount", rejectUnauthenticated, (req, res) => {
//gets total count of all stock items in process
  const queryText = `SELECT count(*) FROM "progress";`;
  pool
    .query(queryText)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((error) => {
      logtail.info(`--DECOQUEUE-- Error on item query ${error}`);
      res.sendStatus(500);
    });
});

router.get("/completelist", rejectUnauthenticated, (req, res) => {
//gets all of the completed items
  const queryText = `SELECT * FROM "complete" ORDER BY id DESC;`;
  pool
    .query(queryText)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((error) => {
      logtail.info(`--DECOQUEUE-- Error on item query ${error}`);
      res.sendStatus(500);
    });
});

router.get("/completelistcount", rejectUnauthenticated, (req, res) => {
//gets a total count of all of the completed items
  const queryText = `SELECT count(*) FROM "complete";`;
  pool
    .query(queryText)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((error) => {
      logtail.info(`--DECOQUEUE-- Error on item query ${error}`);
      res.sendStatus(500);
    });
});

router.post("/orderdetails", (req, res) => {
  //grabs all of the details for a specific order with the BigCommerce API
  let order_number = req.body.order_number;
  //logtail.info("this is the payload before it reaches the get", order_number);
  axios
    .get(
      `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}/products`,
      config
    )
    .then(function (response) {
      //logtail.info("this is the response", response.data);

      res.send(response.data);
    })
    .catch(function (error) {
      // handle error
      logtail.info('--DECOQUEUE-- Error on Order Details: ', error);
    });
});

router.post("/orderlookup", (req, res) => {
  //grabs all of the details for a specific order with the BigCommerce API
  let order_number = req.body.order_number;
  //logtail.info("this is the payload before it reaches the get", order_number);
  axios
    .get(
      `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}`,
      config
    )
    .then(function (response) {
      //logtail.info("this is the response", response.data);

      res.send(response.data);
    })
    .catch(function (error) {
      // handle error
      logtail.info('--DECOQUEUE-- Error on Order Lookup: ', error);
    });
});

router.post("/shippinglookup", (req, res) => {
  //grabs all of the details for a specific order with the BigCommerce API
  let order_number = req.body.order_number;
  //logtail.info("this is the payload before it reaches the get", order_number);
  axios
    .get(
      `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}/shipping_addresses`,
      config
    )
    .then(function (response) {
      //logtail.info("this is the response", response.data);

      res.send(response.data);
    })
    .catch(function (error) {
      // handle error
      logtail.info('--DECOQUEUE--  Error on Shipping Lookup: ', error);
    });
});

router.post("/productlookup", (req, res) => {
  //grabs all of the details for a specific order with the BigCommerce API
  let order_number = req.body.order_number;
  //logtail.info("this is the payload before it reaches the get", order_number);
  axios
    .get(
      `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}/products`,
      config
    )
    .then(function (response) {
      //logtail.info("this is the response", response.data);

      res.send(response.data);
    })
    .catch(function (error) {
      // handle error
      logtail.info('--DECOQUEUE--  Error on Product Lookup: ', error);
    });
});

module.exports = router;