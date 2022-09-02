const express = require("express");
const {
  rejectUnauthenticated,
} = require("../modules/authentication-middleware");
const encryptLib = require("../modules/encryption");
const pool = require("../modules/pool");
const userStrategy = require("../strategies/user.strategy");
let crypto = require("crypto");
const router = express.Router();
const axios = require("axios");
const moment = require('moment');
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
require("dotenv").config();

const { Logtail } = require("@logtail/node");

const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

let storeHash = process.env.STORE_HASH

//defines dates to auto delete certain things from the database.
let daterange = moment().subtract(5, "hours").subtract(30, "days");
let daterange2 = moment().subtract(5, "hours").subtract(2, "years");

//BigCommerce API tokens and keys
let config = {
  headers: {
    "X-Auth-Client": process.env.BG_AUTH_CLIENT,
    "X-Auth-Token": process.env.BG_AUTH_TOKEN,
  },
};

router.delete("/deletecompleterange", rejectUnauthenticated, (req, res) => {
  //deletes any completed orders after 30 days
 pool
   .query('DELETE FROM "complete" WHERE timestamp<=$1', [daterange])
   .then((result) => {
     res.sendStatus(204); //No Content
   })
   .catch((error) => {
     logtail.info("--DECOQUEUE-- Error DELETE ", error);
     res.sendStatus(500);
   });
})

router.delete("/deletehistoryrange", rejectUnauthenticated, (req, res) => {
  //deletes any customer coraspondance after 2 years
  pool
    .query('DELETE FROM "history" WHERE timestamp<=$1', [daterange2])
    .then((result) => {
      res.sendStatus(204); //No Content
    })
    .catch((error) => {
      logtail.info("--DECOQUEUE-- Error DELETE ", error);
      res.sendStatus(500);
    });
});

setInterval(() => {
  //defines the dates to be used for the timestamp
    let nowMonth = Number(moment().subtract(5, "hours").month()) + 1;
    let nowYear = Number(moment().subtract(5, "hours").year());
    let nowDay = Number(moment().subtract(5, "hours").date());
    let hour = Number(moment().subtract(5, "hours").hour());
    let min = Number(moment().subtract(5, "hours").minute());
    let sec = Number(moment().subtract(5, "hours").second());
    //make sure all numbers come in as a double digit
    if (hour < 10) {
      hour = "0" + String(hour);
    }
    if (min < 10) {
      min = "0" + String(min);
    }
    if (sec < 10) {
      sec = "0" + String(sec);
    }
    //make sure the previous month from Jan is December of the previous year
    if (nowMonth === 1) {
      prevYear = moment().year() - 1;
    }
    //checks for new orders, always pulls up the most recent
  axios
    .get(
      `https://api.bigcommerce.com/stores/${storeHash}/v2/orders?sort=date_created:desc&limit=20&page=2`,
      config
    )
    .then(function (response) {
      let data = response.data;
      for (let index = 0; index < data.length; index++) {
        let element = data[index];
        let order = element;
        let orderID = order.id;
        let email = order.billing_address.email;
        let first_name = order.billing_address.first_name;
        let last_name = order.billing_address.last_name;
        const queryText = `SELECT * from "item_queue" where order_number=$1;`;
        pool
          .query(queryText, [orderID])
              .then((result3) => {
                let rows1 = JSON.stringify(result3.rows);
                const query4Text = `SELECT * from "progress" where order_number=$1;`;
                pool
                  .query(query4Text, [orderID])
                  .then((result4) => {
                    let rows2 = JSON.stringify(result4.rows);
                    const query5Text = `SELECT * from "complete" where order_number=$1;`;
                    pool
                      .query(query5Text, [orderID])
                              .then((result7) => {
                                let rows3 = JSON.stringify(result7.rows);

                                if (
                                  rows1 === "[]" &&
                                  rows2 === "[]" &&
                                  rows3 === "[]"
                                ) {
                                  //logtail.info(orderID, "checking order");
                                  //converts to am/pm time
                                  if (
                                    element !== []
                                    //  && payment_status === "captured"
                                  ) {
                                    let normalHour = Number(hour);
                                    let AmPm = "am";
                                    if (normalHour > 12) {
                                      AmPm = "pm";
                                      normalHour = normalHour - 12;
                                    } else if (normalHour === 12) {
                                      AmPm = "pm";
                                    } else if (normalHour === 00) {
                                      AmPm = "am";
                                      normalHour = 12;
                                    }
                                    //defines a datestring used for the timestamp
                                    let dateString = `Date: ${nowMonth}/${nowDay}/${nowYear} Time: ${normalHour}:${min}:${sec}${AmPm}`;
                                    //uses the url from the api to check the products url on that order
                                    axios
                                      .get(`${element.products.url}`, config)
                                      .then(function (response) {
                                        if (element !== []) {
                                          let data = response.data;
                                          for (
                                            let index = 0;
                                            index < data.length;
                                            index++
                                          ) {
                                            let decoSku = "";
                                            let decoSku6 = "";
                                            let decoSku3 = "";
                                            let decoSku8 = "";
                                            let decoSku7 = "";

                                            const element2 = data[index];
                                            let options =
                                              element2.product_options;
                                            let qty = element2.quantity;
                                            //arrays used to determan how emails appear when sent
                                            let optionsArray = [];
                                            let orderComments = [];
                                            let name = element2.name;
                                            //slices up the sku numbers to check certain parts of the string
                                            decoSku = element2.sku;
                                            decoSku6 = decoSku.slice(0, 6);
                                            decoSku3 = decoSku.slice(0, 3);
                                            decoSku8 = decoSku.slice(0, 8);
                                            decoSku7 = decoSku.slice(0, 7);

                                            if (
                                              //if the sliced skews match the below criteria...
                                              decoSku3 === "CD1" ||
                                              decoSku3 === "CD2" ||
                                              decoSku3 === "CD3" ||
                                              decoSku3 === "CD4" ||
                                              decoSku3 === "CD5" ||
                                              decoSku3 === "CD6" ||
                                              decoSku3 === "CD7" ||
                                              decoSku3 === "CD8" ||
                                              decoSku3 === "CD9" ||
                                              decoSku3 === "CS1" ||
                                              decoSku3 === "CS2" ||
                                              decoSku3 === "CS3" ||
                                              decoSku3 === "CS4" ||
                                              decoSku3 === "CS5" ||
                                              decoSku3 === "CS6" ||
                                              decoSku3 === "CS7" ||
                                              decoSku3 === "CS8" ||
                                              decoSku3 === "CS9" ||
                                              decoSku3 === "SD1" ||
                                              decoSku3 === "SD2" ||
                                              decoSku3 === "SD3" ||
                                              decoSku3 === "SD4" ||
                                              decoSku3 === "SD5" ||
                                              decoSku3 === "SD6" ||
                                              decoSku3 === "SD7" ||
                                              decoSku3 === "SD8" ||
                                              decoSku3 === "SD9" ||
                                              decoSku3 === "SDC" ||
                                              decoSku3 === "SDW" ||
                                              decoSku6 === "CUSTOM" ||
                                              decoSku6 === "SUBKIT" ||
                                              decoSku6 === "SUBPAT" ||
                                              decoSku8 === "SETUPFEE" ||
                                              decoSku8 === "PRIDE-" ||
                                              decoSku8 === "SKULLS-R" ||
                                              decoSku8 === "AUTISM-R" ||
                                              decoSku8 === "SPIRITUA" ||
                                              decoSku7 === "SISER-1" ||
                                              decoSku7 === "SISER-2" ||
                                              decoSku7 === "SISER-3" ||
                                              decoSku7 === "SISER-4" ||
                                              decoSku7 === "SISER-5" ||
                                              decoSku7 === "SISER-6" ||
                                              decoSku7 === "SISER-7" ||
                                              decoSku7 === "SISER-8" ||
                                              decoSku7 === "SISER-9" ||
                                              decoSku3 === "SP-" 
                                            ) {
                                              //run the logic that places the skus in the stock queue
                                              logtail.info(
                                                '--DECOQUEUE--',
                                                orderID,
                                                "goes into stock queue"
                                              );
                                              let product_length = "";
                                              for (
                                                let j = 0;
                                                j < options.length;
                                                j++
                                              ) {
                                                const opt = options[j];
                                                let display_name =
                                                  opt.display_name;
                                                //some strings are overly long and have unneeded info, checking for those and simplify
                                                let checkName = display_name.slice(
                                                  0,
                                                  10
                                                );
                                                let checkName2 = display_name.slice(
                                                  0,
                                                  18
                                                );
                                                if (
                                                  checkName === "Sheet Size"
                                                ) {
                                                  //if the first ten letters are Sheet Size, show just that
                                                  optionsArray.push(
                                                    `${checkName}: ${opt.display_value}`
                                                  );
                                                } else if (
                                                  display_name === "Length"
                                                ) {
                                                  //if the display name of the product option is "length", define product length as it's value, ignore all others
                                                  product_length =
                                                    opt.display_value;
                                                } else if (
                                                  display_name ===
                                                  "Tone"
                                                ) {
                                                  //if display name is "Order Comments", push the name and value of that product option
                                                  name = `${name} - ${opt.display_value}`;
                                                } else if (
                                                  display_name ===
                                                  "Order Comments"
                                                ) {
                                                  //if display name is "Order Comments", push the name and value of that product option
                                                  orderComments.push(
                                                    `${opt.display_name}: ${opt.display_value}`
                                                  );
                                                } else if (
                                                  checkName2 ===
                                                  "Garment Type/Color"
                                                ) {
                                                  //if the first 18 letters of the name state "Garment Type/Color", just use that and push the value
                                                  optionsArray.push(
                                                    `${checkName2}: ${opt.display_value}`
                                                  );
                                                } else if (
                                                  display_name ===
                                                  "Upload File"
                                                ) {
                                                  //if diplay name is Upload File, just skip it
                                                  logtail.info(
                                                    "skipping upload file"
                                                  );
                                                } else {
                                                  //....push everything else
                                                  optionsArray.push(
                                                    `${opt.display_name}: ${opt.display_value}`
                                                  );
                                                }
                                              }
                                              //join the arrays as one string
                                              let optionsJoined = optionsArray.join(
                                                ""
                                              );
                                              //...and throw them in the database
                                              const query2Text =
                                                'INSERT INTO "item_queue" (email, first_name, last_name, order_number, sku, qty, product_length, product_options, created_at, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id';
                                              pool.query(query2Text, [
                                                email,
                                                first_name,
                                                last_name,
                                                orderID,
                                                decoSku,
                                                qty,
                                                product_length,
                                                optionsJoined,
                                                dateString,
                                                name,
                                              ]);
                                              //empties the arrays for the next order
                                              optionsArray = [];
                                              orderComments = [];
                                            } else {
                                              //...ignore everything else
                                              // logtail.info(
                                              //   "not a decovibe sku",
                                              //   decoSku,
                                              //   "for order",
                                              //   orderID
                                              // );
                                            }
                                          }
                                        }
                                      })
                                      .catch(function (error) {
                                        // handle error
                                        logtail.info(error);
                                      });
                                  } else {
                                    logtail.info(`--DECOQUEUE-- ${orderID} not authorized`);
                                  }
                                } else {
                                  // logtail.info(
                                  //   orderID,
                                  //   "already in the database"
                                  // );
                                }
                              })
                              .catch((error) => {
                                logtail.info(`--DECOQUEUE-- Error on item query ${error}`);
                              });
                          })
                  .catch((error) => {
                    logtail.info(`--DECOQUEUE-- Error on item query ${error}`);
                  });
              })
          .catch((error) => {
            logtail.info(`Error on item query ${error}`);
          });
      }
    })
    .catch(function (error) {
      // handle error
      logtail.info(error);
    });
    //...check for new orders every 2 min
}, 1000 * 60 * 2);

router.post("/starttask", rejectUnauthenticated, (req, res, next) => {
  // places items from the new col in the stock queue to in process
  const email = req.body.email;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const order_number = req.body.order_number;
  const sku = req.body.sku;
  const description = req.body.description;
  const product_length = req.body.product_length;
  const product_options = req.body.product_options;
  const qty = req.body.qty;
  const assigned = req.body.assigned;
  const created_at = req.body.created_at;
  const priority = req.body.priority;

  const query2Text =
    'INSERT INTO "progress" (email, first_name, last_name, order_number, sku, product_length, product_options, qty, assigned, created_at, description, priority) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id';
  pool
    .query(query2Text, [
      email,
      first_name,
      last_name,
      order_number,
      sku,
      product_length,
      product_options,
      qty,
      assigned,
      created_at,
      description,
      priority,
    ])
    .then((result) => res.status(201).send(result.rows))
    .catch(function (error) {
      logtail.info("--DECOQUEUE-- Sorry, there was an error with your query: ", error);
      res.sendStatus(500); // HTTP SERVER ERROR
    })

    .catch(function (error) {
      logtail.info("--DECOQUEUE-- Sorry, there is an error", error);
      res.sendStatus(500);
    });
});

router.post("/gobacknew", rejectUnauthenticated, (req, res, next) => {
  // places items from the in process queue in stock orders back to new
  const email = req.body.email;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const order_number = req.body.order_number;
  const sku = req.body.sku;
  const description = req.body.description;
  const product_length = req.body.product_length;
  const product_options = req.body.product_options;
  const qty = req.body.qty;
  const assigned = req.body.assigned;
  const created_at = req.body.created_at;
  const priority = req.body.priority;

  const query2Text =
    'INSERT INTO "item_queue" (email, first_name, last_name, order_number, sku, product_length, product_options, qty, assigned, created_at, description, priority) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id';
  pool
    .query(query2Text, [
      email,
      first_name,
      last_name,
      order_number,
      sku,
      product_length,
      product_options,
      qty,
      assigned,
      created_at,
      description,
      priority
    ])
    .then((result) => res.status(201).send(result.rows))
    .catch(function (error) {
      logtail.info("--DECOQUEUE-- Sorry, there was an error with your query: ", error);
      res.sendStatus(500); // HTTP SERVER ERROR
    })
});

router.post("/markcomplete", rejectUnauthenticated, (req, res, next) => {
  // marks orders as complete and places them in the complete table
  const email = req.body.email;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const order_number = req.body.order_number;
  const sku = req.body.sku;
  const description = req.body.description;
  const product_length = req.body.product_length;
  const product_options = req.body.product_options;
  const qty = req.body.qty;
  const assigned = req.body.assigned;
  const created_at = req.body.created_at;
  const priority = req.body.priority;
  const item_type = req.body.item_type;
  const query2Text =
    'INSERT INTO "complete" (email, first_name, last_name, order_number, sku, product_length, product_options, qty, created_at, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id';
  pool
    .query(query2Text, [
      email,
      first_name,
      last_name,
      order_number,
      sku,
      product_length,
      product_options,
      qty,
      created_at,
      description
    ])
    .then((result) => res.status(201).send(result.rows))
    .catch(function (error) {
      logtail.info("--DECOQUEUE-- Sorry, there was an error with your query: ", error);
      res.sendStatus(500); // HTTP SERVER ERROR
    })

    .catch(function (error) {
      logtail.info("--DECOQUEUE-- Sorry, there is an error", error);
      res.sendStatus(500);
    });
});



module.exports = router;
