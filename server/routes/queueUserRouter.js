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
          const queryText = `SELECT * from "item" where order_number=$1;`;
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
                                                decoSku5 === "SP-" ||
                                                decoSku5 === "CP-"
                                                
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
                                                  'INSERT INTO "item" (email, first_name, last_name, order_number, sku, qty, product_length, product_options, created_at, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id';
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
    'INSERT INTO "item" (email, first_name, last_name, order_number, sku, product_length, product_options, qty, assigned, created_at, description, priority) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id';
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

router.post("/customerresponse", (req, res, next) => {
  // function that's run when customer responds to their email query
  let pic1 = req.body.pic1
  let pic2 = req.body.pic2;
  let pic3 = req.body.pic3;
  let pic4 = req.body.pic4;
  let pic5 = req.body.pic5;
  let pic6 = req.body.pic6;
  let pic7 = req.body.pic7;
  let pic8 = req.body.pic8;
  let pic9 = req.body.pic9;
  let pic10 = req.body.pic10;
  let pic11 = req.body.pic11;
  let pic12 = req.body.pic12;
  let pic13 = req.body.pic13;
  let pic14 = req.body.pic14;
  let pic15 = req.body.pic15;
  let pic16 = req.body.pic16;
  let pic17 = req.body.pic17;
  let pic18 = req.body.pic18;
  let pic19 = req.body.pic19;
  let pic20 = req.body.pic20;
  let approve = req.body.approve
  let comments = req.body.comments;
  //generates unique customer identifier
  let token = req.body.token;
  //define date
                       let nowMonth =
                         Number(moment().subtract(5, "hours").month()) + 1;
                       let nowYear = Number(
                         moment().subtract(5, "hours").year()
                       );
                       let prevYear = Number(
                         moment().subtract(5, "hours").year()
                       );
                       let nowDay = Number(
                         moment().subtract(5, "hours").date()
                       );
                       let hour = Number(moment().subtract(5, "hours").hour());
                       let min = Number(moment().subtract(5, "hours").minute());
                       let sec = Number(moment().subtract(5, "hours").second());
                       if (hour < 10) {
                         hour = "0" + String(hour);
                       }
                       if (min < 10) {
                         min = "0" + String(min);
                       }
                       if (sec < 10) {
                         sec = "0" + String(sec);
                       }
                       if (nowMonth === 1) {
                         prevYear = moment().year() - 1;
                       }
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
                       let comment_made_at = `Date: ${nowMonth}/${nowDay}/${nowYear} Time: ${normalHour}:${min}:${sec}${AmPm}`;
//only update database in the area that matches the customer identification number
  const queryText = pool
    .query(`SELECT * FROM "customerconfirm" WHERE token='${token}'`)
    .then((result) => {
      email = result.rows[0].email;
      first_name = result.rows[0].first_name;
      last_name = result.rows[0].last_name;
      order_number = result.rows[0].order_number;
      sku = result.rows[0].sku;
      description = result.rows[0].description;
      qty = result.rows[0].qty;
      assigned = result.rows[0].assigned;
      created_at = result.rows[0].created_at;
      priority = result.rows[0].priority;
      item_type = result.rows[0].item_type;
      approvepic1 = result.rows[0].upload_url1;
      approvepic2 = result.rows[0].upload_url2;
      approvepic3 = result.rows[0].upload_url3;
      approvepic4 = result.rows[0].upload_url4;
      approvepic5 = result.rows[0].upload_url5;
      approvepic6 = result.rows[0].upload_url6;
      approvepic7 = result.rows[0].upload_url7;
      approvepic8 = result.rows[0].upload_url8;
      approvepic9 = result.rows[0].upload_url9;
      approvepic10 = result.rows[0].upload_url10;
      approvepic11 = result.rows[0].upload_url11;
      approvepic12 = result.rows[0].upload_url12;
      approvepic13 = result.rows[0].upload_url13;
      approvepic14 = result.rows[0].upload_url14;
      approvepic15 = result.rows[0].upload_url15;
      approvepic16 = result.rows[0].upload_url16;
      approvepic17 = result.rows[0].upload_url17;
      approvepic18 = result.rows[0].upload_url18;
      approvepic19 = result.rows[0].upload_url19;
      approvepic20 = result.rows[0].upload_url20;
      //populate info into the response table that's pulled from the previous query
      if (approve === 'yes') {
           const query2Text =
             'INSERT INTO "customerapproved" (email, first_name, last_name, order_number, sku, qty, assigned, approve, comments, created_at, token, description, priority, upload_url1, upload_url2, upload_url3, upload_url4, upload_url5, upload_url6, upload_url7, upload_url8, upload_url9, upload_url10, upload_url11, upload_url12, upload_url13, upload_url14, upload_url15, upload_url16, upload_url17, upload_url18, upload_url19, upload_url20, item_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34) RETURNING id';
           pool.query(query2Text, [
             email,
             first_name,
             last_name,
             order_number,
             sku,
             qty,
             assigned,
             approve,
             comments,
             created_at,
             token,
             description,
             priority,
             approvepic1,
             approvepic2,
             approvepic3,
             approvepic4,
             approvepic5,
             approvepic6,
             approvepic7,
             approvepic8,
             approvepic9,
             approvepic10,
             approvepic11,
             approvepic12,
             approvepic13,
             approvepic14,
             approvepic15,
             approvepic16,
             approvepic17,
             approvepic18,
             approvepic19,
             approvepic20,
             item_type,
           ]);
      } else {
      const query2Text =
        'INSERT INTO "customerrespond" (email, first_name, last_name, order_number, sku, qty, assigned, approve, comments, created_at, token, description, priority, upload_url1, upload_url2, upload_url3, upload_url4, upload_url5, upload_url6, upload_url7, upload_url8, upload_url9, upload_url10, upload_url11, upload_url12, upload_url13, upload_url14, upload_url15, upload_url16, upload_url17, upload_url18, upload_url19, upload_url20, item_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34) RETURNING id';
      pool.query(query2Text, [
        email,
        first_name,
        last_name,
        order_number,
        sku,
        qty,
        assigned,
        approve,
        comments,
        created_at,
        token,
        description,
        priority,
        pic1,
        pic2,
        pic3,
        pic4,
        pic5,
        pic6,
        pic7,
        pic8,
        pic9,
        pic10,
        pic11,
        pic12,
        pic13,
        pic14,
        pic15,
        pic16,
        pic17,
        pic18,
        pic19,
        pic20,
        item_type,
      ]);
      }
        //...and save any cooraspondance into the history
         const query3Text =
        'INSERT INTO "history" (email, first_name, last_name, order_number, sku, qty, assigned, comment_made_at, customercomments) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id';
      pool
        .query(query3Text, [
          email,
          first_name,
          last_name,
          order_number,
          sku,
          qty,
          assigned,
          comment_made_at,
          comments,
        ])
        .then((result) => res.status(201).send(result.rows))
        .catch(function (error) {
          console.log("Sorry, there was an error with your query: ", error);
          res.sendStatus(500); // HTTP SERVER ERROR
        })

        .catch(function (error) {
          console.log("Sorry, there is an error", error);
          res.sendStatus(500);
        })
        .then((result) => {
          //...and delete from the customer confirm table since customer responded to prevent duplicate responses
          res.status(201).send(result.rows)
            const query4Text = `DELETE FROM "customerconfirm" WHERE token=$1`;
            pool
              .query(query4Text, [token])
              .then((result) => res.sendStatus(201))
              .catch(function (error) {
                console.log(
                  "Sorry, there was an error with your query: ",
                  error
                );
                res.sendStatus(500); // HTTP SERVER ERROR
              });
        })
        .catch(function (error) {
          console.log("Sorry, there was an error with your query: ", error);
          res.sendStatus(500); // HTTP SERVER ERROR
        })

         

             .catch(function (error) {
               console.log("Sorry, there is an error", error);
               res.sendStatus(500);
             })
        
    });
});

router.post("/customerconfirm", rejectUnauthenticated, (req, res, next) => {
  // defines info thats sent to the customer for proofing
  const email = req.body.email;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const order_number = req.body.order_number;
  const sku = req.body.sku;
  const description = req.body.description;
  const qty = req.body.qty;
  const assigned = req.body.assigned;
  const created_at = req.body.created_at;
  const pic1 = req.body.pic1;
  const pic2 = req.body.pic2;
  const pic3 = req.body.pic3;
  const pic4 = req.body.pic4;
  const pic5 = req.body.pic5;
  const pic6 = req.body.pic6;
  const pic7 = req.body.pic7;
  const pic8 = req.body.pic8;
  const pic9 = req.body.pic9;
  const pic10 = req.body.pic10;
  const pic11 = req.body.pic11;
  const pic12 = req.body.pic12;
  const pic13 = req.body.pic13;
  const pic14 = req.body.pic14;
  const pic15 = req.body.pic15;
  const pic16 = req.body.pic16;
  const pic17 = req.body.pic17;
  const pic18 = req.body.pic18;
  const pic19 = req.body.pic19;
  const pic20 = req.body.pic20;
  const comments = req.body.comments;
  const priority = req.body.priority;
  const payment_link = req.body.payment_link;
  const item_type = req.body.item_type;
  //generates unique customer identifer
  let token = crypto.randomBytes(16).toString("hex");
  //defines the date
  let nowMonth = Number(moment().subtract(5, "hours").month()) + 1;
  let nowYear = Number(moment().subtract(5, "hours").year());
  let nowDay = Number(moment().subtract(5, "hours").date());
  let hour = Number(moment().subtract(5, "hours").hour());
  let min = Number(moment().subtract(5, "hours").minute());
  let sec = Number(moment().subtract(5, "hours").second());
  let proofString = ``
  if (hour < 10) {
    hour = "0" + String(hour);
  }
  if (min < 10) {
    min = "0" + String(min);
  }
  if (sec < 10) {
    sec = "0" + String(sec);
  }
  if (nowMonth === 1) {
    prevYear = moment().year() - 1;
  }
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
  let comment_made_at = `Date: ${nowMonth}/${nowDay}/${nowYear} Time: ${normalHour}:${min}:${sec}${AmPm}`;
  //checks all 20 potential spots for a file
  const pic = [
    pic1,
    pic2,
    pic3,
    pic4,
    pic5,
    pic6,
    pic7,
    pic8,
    pic9,
    pic10,
    pic11,
    pic12,
    pic13,
    pic14,
    pic15,
    pic16,
    pic17,
    pic18,
    pic19,
    pic20,
  ];
  //makes a query to the BigCommerce API so the customer can see the details of their order
  axios
    .get(
      `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}/products`,
      config
    )
    .then(function (response) {
     
      if (response.data !== []) {
        //START THE CONDITIONAL FOR MESSAGE SENDING HERE
         if (pic1 === "" &&
          pic2 === "" &&
          pic3 === "" &&
          pic4 === "" &&
          pic5 === "" &&
          pic6 === "" &&
          pic7 === "" &&
          pic8 === "" &&
          pic9 === "" &&
          pic10 === "" &&
          pic11 === "" &&
          pic12 === "" &&
          pic13 === "" &&
          pic14 === "" &&
          pic15 === "" &&
          pic16 === "" &&
          pic17 === "" &&
          pic18 === "" &&
          pic19 === "" &&
          pic20 === "") {
            //defines the html being sent in the email
            let titleString = `  <div><img
       src="https://cdn11.bigcommerce.com/s-et4qthkygq/product_images/uploaded_images/custom-transfers-email-banner-01.png?t=1623860610&_ga=2.54689192.22532363.1623675567-885995832.1599745631"
       width="100%"
       alt=""
      /></div><br>
                     <div style="color:black; padding-left: 30px; background-color:#DCDCDC; font-family:Arial Narrow, sans-serif; opacity:0.5;"><i>New Message from the Art Department below</i></div><br><br>
<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;"><tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Order number:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${order_number} </td></tr>
<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Sku:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${sku} </td></tr>`;
            let commentsString = `
</table><br><br><table><tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Message from the Art Department:</td></tr><tr><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;">${comments}</td></tr></table><br><br><br>`;
            let array = response.data;
            //defines array to be used for pushing html later
            let newArray = [];
            let optionsArray = [];
            for (let index = 0; index < array.length; index++) {
              //loops through the response data
              const element = array[index];
              let decoSku = element.sku;
              let decoSku3 = decoSku.slice(0, 6);
              let decoSku4 = decoSku.slice(0, 5);
              let decoSku7 = decoSku.slice(0, 7);
              let decoSku6 = decoSku.slice(0, 8);
              if (
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
                newArray.push(
                  `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Item Name:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.name}</td></tr>
              <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Quantity:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.quantity}</td></tr>`
                );
                let options = element.product_options;
                for (let j = 0; j < options.length; j++) {
                  //...then loop through the product options for that sku
                  const opt = options[j];
                  //...and push into the options array
                  let display_name = opt.display_name;
                  let new_display_name = String(display_name.slice(0, 10));
                  let reorder_display_name = String(display_name.slice(0, 18));
                  let transfer_display_name = String(display_name.slice(0, 14));
                  if (new_display_name === "Sheet Size") {
                    optionsArray.push(
                      `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${new_display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                    );
                  } else if (
                    reorder_display_name === "Is this a reorder?" ||
                    reorder_display_name === "Garment Type/Color"
                  ) {
                    optionsArray.push(
                      `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${reorder_display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                    );
                  } else if (transfer_display_name === "Transfer Count") {
                    console.log("skipping Transfer Count");
                  } else {
                    optionsArray.push(
                      `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${opt.display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                    );
                  }
                }
                //join into one string
                let optionsJoined = optionsArray.join("");
                //...then push that joined array into the main array
                newArray.push(optionsJoined);
                newArray.push(commentsString);
                newArray.push(proofString);
                //empty the optionsArray to get ready for the next order
                optionsArray = [];
              }
            }
            let buttonsArray = [];
            //join the array into one string
              buttonsArray.push(
                `<div style="width: 500px;"><a style="font-size:15px; text-decoration: none;" href="http://decoqueue.heattransferwarehouse.com/#/vS1pfTQrIAm5Gi771xdHIDmbrsez0Yzbj17bYhBvcKwUAYisUaLk3liJlMieIZ3qFJTPLSZxBpyzakbE6SWNA6xWgAUun5Gj2kNo/${token}"><button style="background-color: white; color: #909090; font-family:Arial Narrow, sans-serif; text-align: center; padding: 15px; width: 50%; float:left;"><i>Click to Reply</i></button></a></div>
`
              );
            let buttonsJoined = buttonsArray.join("");
            let joinedArray = newArray.join("");
            //then define the final string to be sent
            let locationInfo = 'Heat Transfer Warehouse Company. 1501 21st Avenue North Fargo, North Dakota 58102';
            let lastString = `<br><br><br><br><br><br><div style="color:#DCDCDC; background-color:#DCDCDC; font-family:Arial Narrow, sans-serif; opacity:0.5;">${locationInfo}</div>`;
            let finalArray =
              `<html>` +
              `<div>` +
              titleString +
              joinedArray +
              buttonsJoined +
              lastString +
              `</div>` +
              `</html>`;
            //empty newArray for next order
            newArray = [];
            console.log(finalArray);
            //...END THE CONDITIONAL FOR MESSAGE SENDING HERE
            const msg = {
              personalizations: [
                {
                  to: [
                    //send to the customers email address
                    {
                      email: email,
                    },
                  ],
                  bcc: [
                    //bcc me for testing purposes for emails
                    {
                      email: "tre@heattransferwarehouse.com",
                    },
                  ],
                },
              ],
              from: "Transfers@heattransferwarehouse.com", // Use the email address or domain you verified above
              subject: `New message from the Art Department regarding order ${order_number}`,
              //send the entire finalArray as one string
              html: finalArray,
            };
            (async () => {
              try {
                await sgMail.send(msg);
              } catch (error) {
                console.error(error);

                if (error.response) {
                  console.error(error.response.body);
                }
              }
            })();
          } else {
        //defines the html being sent in the email
        let titleString = `  <div><img
       src="https://cdn11.bigcommerce.com/s-et4qthkygq/product_images/uploaded_images/custom-transfers-email-banner-01.png?t=1623860610&_ga=2.54689192.22532363.1623675567-885995832.1599745631"
       width="100%"
       alt=""
      /></div><br>
                     <div style="color:black; padding-left: 30px; background-color:#DCDCDC; font-family:Arial Narrow, sans-serif; opacity:0.5;"><i>Please confirm the details below for your recent custom order</i></div><br><br>
<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;"><tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Order number:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${order_number} </td></tr>
<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Sku:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${sku} </td></tr>`;
               let commentsString = `
<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Art Room Comments:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;">${comments}</td></tr></table><br><br><br>`;
        let array = response.data;
        //defines array to be used for pushing html later
        let newArray = [];
        let optionsArray = [];
        for (let index = 0; index < array.length; index++) {
          //loops through the response data
          const element = array[index];
                   let decoSku = element.sku;
                   let decoSku3 = decoSku.slice(0, 6);
                   let decoSku4 = decoSku.slice(0, 5);
                   let decoSku7 = decoSku.slice(0, 7);
                   let decoSku6 = decoSku.slice(0, 8);
                   if (
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
                     //checks if the sku is the one that matches the one the email is pertaining to
                     //...if so, push the array
                     proofString = `<div><a style="font-size:30px; text-decoration: none;" href=${pic[index]}><button style="background-color: #006bd6; width: 250px; color: white; font-size: 20px; font-family:Arial Narrow, sans-serif; text-align: center; margin: 0px; padding: 25px;"><i>View Proof</i></button></a></div><br><br>`;
                     newArray.push(
                       `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Item Name:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.name}</td></tr>
              <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Quantity:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.quantity}</td></tr>`
                     );
                     let options = element.product_options;
                     for (let j = 0; j < options.length; j++) {
                       //...then loop through the product options for that sku
                       const opt = options[j];
                       //...and push into the options array
                       let display_name = opt.display_name;
                       let new_display_name = String(display_name.slice(0, 10));
                       let reorder_display_name = String(
                         display_name.slice(0, 18)
                       );
                       let transfer_display_name = String(
                         display_name.slice(0, 14)
                       );
                       if (new_display_name === "Sheet Size") {
                         optionsArray.push(
                           `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${new_display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                         );
                       } else if (
                         reorder_display_name === "Is this a reorder?" ||
                         reorder_display_name === "Garment Type/Color"
                       ) {
                         optionsArray.push(
                           `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${reorder_display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                         );
                       } else if (transfer_display_name === "Transfer Count") {
                         console.log("skipping Transfer Count");
                       } else {
                         optionsArray.push(
                           `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${opt.display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                         );
                       }
                     }
                     //join into one string
                     let optionsJoined = optionsArray.join("");
                     //...then push that joined array into the main array
                     newArray.push(optionsJoined);
                     newArray.push(commentsString);
                     newArray.push(proofString);
                     //empty the optionsArray to get ready for the next order
                     optionsArray = [];
                   }
        }
         let buttonsArray = [];
        //join the array into one string
                if (payment_link === "" || payment_link === null) {
                  //...if a payment link was not sent, push the below html
                  buttonsArray.push(
                    `<div style="width: 250px;"><div><a style="font-size:15px; text-decoration: none;" href="http://decoqueue.heattransferwarehouse.com/#/vS1pfTQrIAm5Gi771xdHIDmbrsez0Yzbj17bYhBvcKwUAYisUaLk3liJlMieIZ3qFJTPLSZxBpyzakbE6SWNA6xWgAUun5Gj2kNo/${token}"><button style="background-color: white; color: #909090; font-family:Arial Narrow, sans-serif; text-align: center; padding: 15px; width: 50%; float:left;"><i>Request Changes</i></button></a></div>
                             <div><a style="font-size:15px; text-decoration: none;" href="http://decoqueue.heattransferwarehouse.com/#/vS1pfTQrIAm5Gi771xdHIDmbrsez0Yzbj17bYhBvcKwUAYisUaLk3liJlMieIZ3qFJTPLSZxBpyzakbE6SWNA6xWgAUun5Gj2kqF/${token}"><button style="background-color: #006bd6; color: white; font-family:Arial Narrow, sans-serif; text-align: center; padding: 15px; width: 50%; float:right;"><i>Approve</i></button></a></div></div><br><br><br><br>
`
                  );
                } else {
                  //...if a payment link was sent, push the below html which includes a payment link
                  buttonsArray.push(
                    `<div style="width: 250px;"><div><a style="font-size:15px; text-decoration: none;" href="http://decoqueue.heattransferwarehouse.com/#/vS1pfTQrIAm5Gi771xdHIDmbrsez0Yzbj17bYhBvcKwUAYisUaLk3liJlMieIZ3qFJTPLSZxBpyzakbE6SWNA6xWgAUun5Gj2kNo/${token}"><button style="background-color: white; color: #909090; font-family:Arial Narrow, sans-serif; text-align: center; padding: 15px; width: 50%; float:left;"><i>Request Changes</i></button></a></div>
                             <div><a style="font-size:15px; text-decoration: none;" href="http://decoqueue.heattransferwarehouse.com/#/vS1pfTQrIAm5Gi771xdHIDmbrsez0Yzbj17bYhBvcKwUAYisUaLk3liJlMieIZ3qFJTPLSZxBpyzakbE6SWNA6xWgAUun5Gj2kqF/${token}"><button style="background-color: #006bd6; color: white; font-family:Arial Narrow, sans-serif; text-align: center; padding: 15px; width: 50%; float:right;"><i>Approve</i></button></a></div></div>
                             <div><a style="font-size:30px; text-decoration: none;" href=${payment_link}><button style="background-color: #006bd6; color: white; font-family:Arial Narrow, sans-serif; text-align: center; width: 250px; margin: 0px; padding: 15px;"><i>Finalize Payment</i></button></a><br><br></div>`
                  );
                }
         let buttonsJoined = buttonsArray.join("");
        let joinedArray = newArray.join("");
        //then define the final string to be sent
        let locationInfo2 = 'Heat Transfer Warehouse Company. 1501 21st Avenue North Fargo, North Dakota 58102';
        let lastString = `<div style="color:#DCDCDC; background-color:#DCDCDC; font-family:Arial Narrow, sans-serif; opacity:0.5;">${locationInfo2}</div>`;
        let finalArray =
          `<html>` +
          `<div>` +
          titleString +
          joinedArray +
          buttonsJoined +
          lastString +
          `</div>` +
          `</html>`;
          //empty newArray for next order
        newArray = [];
        console.log(finalArray);
//...END THE CONDITIONAL FOR MESSAGE SENDING HERE
        const msg = {
          personalizations: [
            {
              to: [
                //send to the customers email address
                {
                  email: email,
                },
              ],
              bcc: [
                //bcc me for testing purposes for emails
                {
                  email: "tre@heattransferwarehouse.com",
                },
              ],
            },
          ],
          from: "Transfers@heattransferwarehouse.com", // Use the email address or domain you verified above
          subject: `Please confirm details for your order: ${order_number}`,
          //send the entire finalArray as one string
          html: finalArray,
        };
        (async () => {
          try {
            await sgMail.send(msg);
          } catch (error) {
            console.error(error);

            if (error.response) {
              console.error(error.response.body);
            }
          }
        })();
      }
      }
    });
    //...then place into the customer confirm table until the customer responds
  const query2Text =
    'INSERT INTO "customerconfirm" (email, first_name, last_name, order_number, sku, qty, assigned, created_at, upload_url1, upload_url2, upload_url3, upload_url4, upload_url5, upload_url6, upload_url7, upload_url8, upload_url9, upload_url10, upload_url11, upload_url12, upload_url13, upload_url14, upload_url15, upload_url16, upload_url17, upload_url18, upload_url19, upload_url20, comments, token, description, priority, item_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33) RETURNING id';
  pool.query(query2Text, [
    email,
    first_name,
    last_name,
    order_number,
    sku,
    qty,
    assigned,
    created_at,
    pic1,
    pic2,
    pic3,
    pic4,
    pic5,
    pic6,
    pic7,
    pic8,
    pic9,
    pic10,
    pic11,
    pic12,
    pic13,
    pic14,
    pic15,
    pic16,
    pic17,
    pic18,
    pic19,
    pic20,
    comments,
    token,
    description,
    priority,
    item_type,
  ]);
  //...then place into the history table to keep track of coraspondance
  const query3Text =
    'INSERT INTO "history" (email, first_name, last_name, order_number, sku, qty, assigned, comment_made_at, admincomments) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id';
  pool
    .query(query3Text, [
      email,
      first_name,
      last_name,
      order_number,
      sku,
      qty,
      assigned,
      comment_made_at,
      comments,
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
    'INSERT INTO "complete" (email, first_name, last_name, order_number, sku, product_length, product_options, qty, assigned, created_at, description, priority, item_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id';
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

router.post("/markcompletecustom", rejectUnauthenticated, (req, res, next) => {
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
  const pic1 = req.body.pic1;
  const pic2 = req.body.pic2;
  const pic3 = req.body.pic3;
  const pic4 = req.body.pic4;
  const pic5 = req.body.pic5;
  const pic6 = req.body.pic6;
  const pic7 = req.body.pic7;
  const pic8 = req.body.pic8;
  const pic9 = req.body.pic9;
  const pic10 = req.body.pic10;
  const pic11 = req.body.pic11;
  const pic12 = req.body.pic12;
  const pic13 = req.body.pic13;
  const pic14 = req.body.pic14;
  const pic15 = req.body.pic15;
  const pic16 = req.body.pic16;
  const pic17 = req.body.pic17;
  const pic18 = req.body.pic18;
  const pic19 = req.body.pic19;
  const pic20 = req.body.pic20;
  const query2Text =
    'INSERT INTO "customcomplete" (email, first_name, last_name, order_number, sku, qty, assigned, created_at, description, priority, item_type, upload_url1, upload_url2, upload_url3, upload_url4, upload_url5, upload_url6, upload_url7, upload_url8, upload_url9, upload_url10, upload_url11, upload_url12, upload_url13, upload_url14, upload_url15, upload_url16, upload_url17, upload_url18, upload_url19, upload_url20) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31) RETURNING id';
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
      pic1,
      pic2,
      pic3,
      pic4,
      pic5,
      pic6,
      pic7,
      pic8,
      pic9,
      pic10,
      pic11,
      pic12,
      pic13,
      pic14,
      pic15,
      pic16,
      pic17,
      pic18,
      pic19,
      pic20,
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

router.post("/canned", rejectUnauthenticated, (req, res, next) => {
  const canned = req.body.canned;
  //adds canned responses to the table
  const query2Text =
    'INSERT INTO "replies" (reply) VALUES ($1) RETURNING id';
  pool
    .query(query2Text, [
      canned
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
