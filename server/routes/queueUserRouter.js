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
     console.log("Error DELETE ", error);
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
      console.log("Error DELETE ", error);
      res.sendStatus(500);
    });
});

// Handles Ajax request for user information if user is authenticated
router.get("/", rejectUnauthenticated, (req, res) => {
  // Send back user object from the session (previously queried from the database)
  res.send(req.user);
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
          let item_type = "";
          const queryText = `SELECT * from "item_queue" where order_number=$1;`;
          pool
            .query(queryText, [orderID])
            .then((result) => {
              let rows = JSON.stringify(result.rows);
              const query3Text = `SELECT * from "customitem" where order_number=$1;`;
              pool
                .query(query3Text, [orderID])
                .then((result3) => {
                  let rows3 = JSON.stringify(result3.rows);
                  const query4Text = `SELECT * from "progress" where order_number=$1;`;
                  pool
                    .query(query4Text, [orderID])
                    .then((result4) => {
                      let rows4 = JSON.stringify(result4.rows);
                      const query5Text = `SELECT * from "complete" where order_number=$1;`;
                      pool
                        .query(query5Text, [orderID])
                        .then((result5) => {
                          let rows5 = JSON.stringify(result5.rows);
                          const query6Text = `SELECT * from "customerconfirm" where order_number=$1;`;
                          pool
                            .query(query6Text, [orderID])
                            .then((result6) => {
                              let rows6 = JSON.stringify(result6.rows);
                              const query7Text = `SELECT * from "customerrespond" where order_number=$1;`;
                              pool
                                .query(query7Text, [orderID])
                                .then((result7) => {
                                  let rows7 = JSON.stringify(result7.rows);

                                  if (
                                    rows === "[]" &&
                                    rows3 === "[]" &&
                                    rows4 === "[]" &&
                                    rows5 === "[]" &&
                                    rows6 === "[]" &&
                                    rows7 === "[]"
                                  ) {
                                    //console.log(orderID, "checking order");
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
                                              let decoSku3 = "";
                                              let decoSku4 = "";
                                              let decoSku5 = "";
                                              let decoSku6 = "";
                                              let decoSku7 = "";
                                              let decoSku8 = "";

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
                                              decoSku3 = decoSku.slice(0, 6);
                                              decoSku4 = decoSku.slice(0, 5);
                                              decoSku5 = decoSku.slice(0, 3);
                                              decoSku6 = decoSku.slice(0, 8);
                                              decoSku7 = decoSku.slice(0, 7);
                                              decoSku8 = decoSku.slice(0, 11);

                                              if (
                                                //if the sliced skews match the below criteria...
                                                decoSku5 === "CD1" ||
                                                decoSku5 === "CD2" ||
                                                decoSku5 === "CD3" ||
                                                decoSku5 === "CD4" ||
                                                decoSku5 === "CD5" ||
                                                decoSku5 === "CD6" ||
                                                decoSku5 === "CD7" ||
                                                decoSku5 === "CD8" ||
                                                decoSku5 === "CD9" ||
                                                decoSku5 === "CS1" ||
                                                decoSku5 === "CS2" ||
                                                decoSku5 === "CS3" ||
                                                decoSku5 === "CS4" ||
                                                decoSku5 === "CS5" ||
                                                decoSku5 === "CS6" ||
                                                decoSku5 === "CS7" ||
                                                decoSku5 === "CS8" ||
                                                decoSku5 === "CS9" ||
                                                decoSku5 === "SD1" ||
                                                decoSku5 === "SD2" ||
                                                decoSku5 === "SD3" ||
                                                decoSku5 === "SD4" ||
                                                decoSku5 === "SD5" ||
                                                decoSku5 === "SD6" ||
                                                decoSku5 === "SD7" ||
                                                decoSku5 === "SD8" ||
                                                decoSku5 === "SD9" ||
                                                decoSku5 === "SDC" ||
                                                decoSku5 === "SDW" ||
                                                decoSku3 === "CUSTOM" ||
                                                decoSku3 === "SUBKIT" ||
                                                decoSku3 === "SUBPAT" ||
                                                decoSku6 === "SETUPFEE" ||
                                                decoSku6 === "PRIDE-" ||
                                                decoSku6 === "SKULLS-R" ||
                                                decoSku6 === "AUTISM-R" ||
                                                decoSku6 === "SPIRITUA" ||
                                                decoSku7 === "SISER-1" ||
                                                decoSku7 === "SISER-2" ||
                                                decoSku7 === "SISER-3" ||
                                                decoSku7 === "SISER-4" ||
                                                decoSku7 === "SISER-5" ||
                                                decoSku7 === "SISER-6" ||
                                                decoSku7 === "SISER-7" ||
                                                decoSku7 === "SISER-8" ||
                                                decoSku7 === "SISER-9" ||
                                                decoSku5 === "SP-" 
                                              ) {
                                                //run the logic that places the skus in the stock queue
                                                console.log(
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
                                                    console.log(
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
                                              } else if (
                                                //if the sliced skus meet the below conditions
                                                decoSku4 === "BL_A3" ||
                                                decoSku4 === "BL_A4" ||
                                                decoSku4 === "BL_A5" ||
                                                decoSku4 === "BL_LC" ||
                                                decoSku4 === "BL_SM" ||
                                                decoSku3 === "HW_CAP" ||
                                                decoSku3 === "PR_BAG" ||
                                                decoSku3 === "PR_UM_" ||
                                                decoSku4 === "SB_A5" ||
                                                decoSku4 === "SB_A4" ||
                                                decoSku4 === "SB_A3" ||
                                                decoSku4 === "SB_LC" ||
                                                decoSku4 === "SB_SM" ||
                                                decoSku4 === "SB_LS" ||
                                                decoSku4 === "WE_SM" ||
                                                decoSku4 === "WE_LC" ||
                                                decoSku4 === "WE_A5" ||
                                                decoSku4 === "WE_A4" ||
                                                decoSku4 === "WE_A3" ||
                                                decoSku4 === "WE_SQ" ||
                                                decoSku4 === "WE_XS" ||
                                                decoSku7 === "DYESUB-" ||
                                                decoSku4 === "FINAL" ||
                                                decoSku6 === "FEE-VECT"
                                              ) {
                                                if (
                                                  decoSku7 === "DYESUB-" ||
                                                  decoSku8 === "FINAL-DYESU"
                                                ) {
                                                  item_type =
                                                    "Custom Dye Sublimation";
                                                } else if (
                                                  decoSku8 === "FINAL-RHINE"
                                                ) {
                                                  item_type =
                                                    "Custom Rhinestone";
                                                } else if (
                                                  decoSku8 === "FINAL-DIGIT"
                                                ) {
                                                  item_type = "Custom Digital";
                                                } else if (
                                                  decoSku8 === "FINAL-SIGNT"
                                                ) {
                                                  item_type = "Custom Sign";
                                                } else if (
                                                  decoSku4 === "BL_A3" ||
                                                  decoSku4 === "BL_A4" ||
                                                  decoSku4 === "BL_A5" ||
                                                  decoSku4 === "BL_LC" ||
                                                  decoSku4 === "BL_SM" ||
                                                  decoSku3 === "HW_CAP" ||
                                                  decoSku3 === "PR_BAG" ||
                                                  decoSku3 === "PR_UM_" ||
                                                  decoSku4 === "SB_A5" ||
                                                  decoSku4 === "SB_A4" ||
                                                  decoSku4 === "SB_A3" ||
                                                  decoSku4 === "SB_LC" ||
                                                  decoSku4 === "SB_SM" ||
                                                  decoSku4 === "SB_LS" ||
                                                  decoSku4 === "WE_SM" ||
                                                  decoSku4 === "WE_LC" ||
                                                  decoSku4 === "WE_A5" ||
                                                  decoSku4 === "WE_A4" ||
                                                  decoSku4 === "WE_A3" ||
                                                  decoSku4 === "WE_SQ" ||
                                                  decoSku4 === "WE_XS"
                                                ) {
                                                  item_type = "SupaColor";
                                                } else if (decoSku6 === "FEE-VECT") {
                                                  item_type = "Artwork Redraws";
                                                }
                                                  //...place in the custom queue
                                                  console.log(
                                                    orderID,
                                                    "goes into custom queue"
                                                  );
                                                const query2Text =
                                                  'INSERT INTO "customitem" (email, first_name, last_name, order_number, sku, qty, created_at, description, item_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id';
                                                pool.query(query2Text, [
                                                  email,
                                                  first_name,
                                                  last_name,
                                                  orderID,
                                                  decoSku,
                                                  qty,
                                                  dateString,
                                                  name,
                                                  item_type,
                                                ]);
                                              } else if (
                                                //if the sliced skus meet the below conditions
                                                decoSku7 === "INKSOFT"
                                              ) {

                                                async function sendToInksoft () {

                                                console.log('Sending an order to Inksoft..');

                                                let inksoft = await axios
                                                   .get(
                                                     `https://api.bigcommerce.com/stores/${storeHash}/v2/orders/${orderID}/products`,
                                                     config
                                                   )

                                                console.log('Get Products: ', inksoft.data);

                                                let designsToSend = [];
                                                let inksoftCart = []; 
                                                let mainToken = inksoft.data[0].product_options[1].value;
                                                let currentCart = [];

                                                for (const i of inksoft.data) {

                                                let inksoftToken = i.product_options[1].value;
                                                let inksoftName = i.product_options[2].value;
                                                let quantity = i.quantity;

                                                console.log('Token and Name: ', inksoftToken, inksoftName);

                                                inksoftCart = await axios 
                                                  .get(
                                                   `https://stores.inksoft.com/DS350156262/Api2/GetCartPackage?SessionToken=${inksoftToken}&Format=JSON`,
                                                   {
                                                   dataType: 'text',
                                                   data: '',
                                                   processData: false,
                                                   crossDomain: true,
                                                   }
                                                )

                                                currentCart = inksoftCart.data.Data;
                                                console.log('Get Cart: ', currentCart);

                                                let inksoftItems = currentCart.Cart.Items;
                                                let inksoftDesigns = currentCart.DesignSummaries;
                                                let linkedId = 0;
                                                let foundDesign = {};

                                                for (const d of inksoftDesigns) {
                                                  if (d.Name === inksoftName) {
                                                    linkedId = d.DesignID;
                                                  }
                                                }

                                                if (linkedId === 0) {
                                                  return;
                                                } else {
                                                  for (const i of inksoftItems) {
                                                    if (i.DesignId === linkedId) {
                                                      foundDesign = i;
                                                    }
                                                  }
                                                }

                                                if (foundDesign === {}) {
                                                  return;
                                                } else {
                                                  foundDesign.Quantity = quantity;
                                                  designsToSend.push(foundDesign);
                                                }
                                               }

                                               if (designsToSend === []) {
                                                 return;
                                               } else {

                                                 console.log('New Designs: ', designsToSend);

                                                 currentCart.Cart.Items = designsToSend;

                                                 currentCart.Cart.ShippingMethod = 'BrightPearl';

                                                 currentCart.Cart.GuestEmail = '';

                                                 console.log('New Cart Items: ', currentCart.Cart.Items);

                                                //  let newCart1 = {
                                                //    "ID": currentCart.Cart.ID,
                                                //    "CartItemWeight": currentCart.Cart.CartItemWeight,
                                                //    "ItemCount": currentCart.Cart.ItemCount,
                                                //    "ItemTotal": currentCart.Cart.ItemTotal,
                                                //    "Items": designsToSend,
                                                //    "ShippingMethod": 'BrightPearl',
                                                //    "TotalDue": currentCart.Cart.TotalDue
                                                //  }

                                                //  let newCart2 = JSON.stringify(newCart1);

                                                //  let newCart3 = newCart2.replace(/"/g, "'");

                                                 let newCart = JSON.stringify(currentCart.Cart);
                                                  
                                                 let newNewCart = newCart.replace(/"/g, "'");

                                                 let setCartResponse = [];

                                                try {
                                                  let axiosUrl = 'https://stores.inksoft.com/DS350156262/Api2/SetCart';

                                                  let data = 
                                                  {
                                                    data: `Cart=${newNewCart}&Format=JSON&SessionToken=${mainToken}`,
                                                  }

                                                  let config = 
                                                  {
                                                    headers: {
                                                      "Content-Type": "application/x-www-form-urlencoded",
                                                      Accept: "application/x-www-form-urlencoded"
                                                    }
                                                  }

                                                 setCartResponse = await axios.post(axiosUrl, data, config)

                                                  } catch (err) {
                                                    console.log('Error on Set Cart: ', err);
                                                    if (err.response.data.Messages) {
                                                      console.log('Set Cart Error Messgae: ', err.response.data.Messages);
                                                    }
                                                  }

                                                  console.log('SetCart Response: ', setCartResponse);

                                                // const inksoftCreditCart = {
                                                //   Number: 11100001111,
                                                //   ExpirationMonth: 01,
                                                //   ExpirationYear: 2025,
                                                //   CVV: 123
                                                // }

                                                //const fileData = 'file';
                                                //&PaymentMethod=Bolt&CreditCard=${inksoftCreditCart}&FileData=${fileData}

                                                try {
                                                  let axiosUrl = 'https://stores.inksoft.com/DS350156262/Api2/SaveCartOrder';

                                                  let data = 
                                                  {
                                                    data: `ExternalOrderId=${orderID}&SessionToken=${mainToken}&Email=${email}`,
                                                  }

                                                  let config = 
                                                  {
                                                    headers: {
                                                      "Content-Type": "application/x-www-form-urlencoded",
                                                      Accept: "application/x-www-form-urlencoded"
                                                    }
                                                  }

                                                 await axios.post(axiosUrl, data, config)

                                                  } catch (err) {
                                                    console.log('Error on Post Cart: ', err);
                                                  }

                                                 }

                                               }

                                              //sendToInksoft();
                                                
                                              } else {
                                                //...ignore everything else
                                                // console.log(
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
                                          console.log(error);
                                        });
                                    } else {
                                      console.log(`${orderID} not authorized`);
                                    }
                                  } else {
                                    // console.log(
                                    //   orderID,
                                    //   "already in the database"
                                    // );
                                  }
                                })
                                .catch((error) => {
                                  console.log(`Error on item query ${error}`);
                                });
                            })
                            .catch((error) => {
                              console.log(`Error on item query ${error}`);
                            });
                        })
                        .catch((error) => {
                          console.log(`Error on item query ${error}`);
                        });
                    })
                    .catch((error) => {
                      console.log(`Error on item query ${error}`);
                    });
                })
                .catch((error) => {
                  console.log(`Error on item query ${error}`);
                });
            })
            .catch((error) => {
              console.log(`Error on item query ${error}`);
            });
        }
      })
      .catch(function (error) {
        // handle error
        console.log(error);
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
      console.log("Sorry, there was an error with your query: ", error);
      res.sendStatus(500); // HTTP SERVER ERROR
    })

    .catch(function (error) {
      console.log("Sorry, there is an error", error);
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
      console.log("Sorry, there was an error with your query: ", error);
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
      console.log("Sorry, there was an error with your query: ", error);
      res.sendStatus(500); // HTTP SERVER ERROR
    })

    .catch(function (error) {
      console.log("Sorry, there is an error", error);
      res.sendStatus(500);
    });
});

router.post("/backtonew", rejectUnauthenticated, (req, res, next) => {
  // marks orders as complete and places them in the complete table
  const email = req.body.email;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const order_number = req.body.order_number;
  const sku = req.body.sku;
  const description = req.body.description;
  const qty = req.body.qty;
  const assigned = req.body.assigned;
  const created_at = req.body.created_at;
  const priority = req.body.priority;
  const item_type = req.body.item_type;
  const query2Text =
    'INSERT INTO "customitem" (email, first_name, last_name, order_number, sku, qty, assigned, created_at, description, priority, item_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id';
  pool
    .query(query2Text, [
      email,
      first_name,
      last_name,
      order_number,
      sku,
      qty,
      assigned,
      created_at,
      description,
      priority,
      item_type,
    ])
    .then((result) => res.status(201).send(result.rows))
    .catch(function (error) {
      console.log("Sorry, there was an error with your query: ", error);
      res.sendStatus(500); // HTTP SERVER ERROR
    })

    .catch(function (error) {
      console.log("Sorry, there is an error", error);
      res.sendStatus(500);
    });
});

router.post("/addadmin", rejectUnauthenticated, (req, res, next) => {
  // used to reset user logins. It's on a permenent restricted path, only accessesable by manaully changing the code. Extremely secure and protected
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const email = req.body.email;
  const password = encryptLib.encryptPassword(req.body.password);
  const role = req.body.role;

  //now lets add admin information to the user table
  const query2Text =
    'INSERT INTO "user" (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id';
  pool
    .query(query2Text, [first_name, last_name, email, password, role])
    .then((result) => res.status(201).send(result.rows))
    .catch(function (error) {
      console.log("Sorry, there was an error with your query: ", error);
      res.sendStatus(500); // HTTP SERVER ERROR
    })

    .catch(function (error) {
      console.log("Sorry, there is an error", error);
      res.sendStatus(500);
    });
});

router.post("/login", userStrategy.authenticate("local"), (req, res) => {
  console.log("logging body", req.body.username)
  const email = req.body.username;
  // setting query text to update the username
  const queryText = `update "user" set "last_login" = NOW() WHERE "email"=$1`;

  pool.query(queryText, [email]).then((result) => {//when someone logs in, want to capture the time they log in

      res.sendStatus(201)
  });
});

router.post("/logout", (req, res) => {
  // Use passport's built-in method to log out the user
  req.logout();
  res.sendStatus(200);
});

router.post("/inksoft", async function (req, res) {
  const orderID = req.body.orderId;
  console.log('Fetching products for inksoft: ', orderID);

  let inksoft = await axios
    .get(
      `https://api.bigcommerce.com/stores/${storeHash}/v2/orders/${orderID}/products`,
      config
    )

  console.log(`SENDING BACK TO SITE: ${inksoft.data} WITH STATUS: ${inksoft.status}`);
  res.send(inksoft.data).status(inksoft.status);
});



module.exports = router;
