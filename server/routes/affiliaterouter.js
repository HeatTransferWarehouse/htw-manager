require("dotenv").config();
const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const axios = require("axios");
const { WebClient } = require("@slack/web-api");
const { createEventAdapter } = require("@slack/events-api");
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const moment = require("moment");


let dateNow = moment().subtract(1, "days").format('YYYY-MM-DD')
let dateThen = moment().subtract(31, "days").format("YYYY-MM-DD");

setInterval(() => {
  dateNow = moment().format("YYYY-MM-DD");
  dateThen = moment().subtract(30, "days").format("YYYY-MM-DD");
}, 1000 * 60 * 60 * 24);


let config = {
    headers: {
      "X-Auth-Client": process.env.BG_AUTH_CLIENT,
      "X-Auth-Token": process.env.BG_AUTH_TOKEN,
    },
};
  
let daterange = moment().subtract(6, "hours").subtract(1, "years");
  
router.delete("/deleteitemrange", (req, res) => {
    pool
      .query('DELETE FROM "affiliate" WHERE created_at<=$1', [daterange])
      .then((result) => {
        res.sendStatus(204); //No Content
      })
      .catch((error) => {
        console.log("Error DELETE ", error);
        res.sendStatus(500);
      });
});
  
router.delete("/deleteskurange", (req, res) => {
    pool
      .query('DELETE FROM "sku" WHERE created_at<=$1', [daterange])
      .then((result) => {
        res.sendStatus(204); //No Content
      })
      .catch((error) => {
        console.log("Error DELETE ", error);
        res.sendStatus(500);
      });
});
  
router.post("/events", async (req, res) => {
      if (req.body.challenge) {
      let status = 200;
      res.status(status).send(req.body.challenge);
      console.log("this is running on message to verify challenge")
      } else {
          let status = 200;
          res.sendStatus(status)
           let text = req.body.event.text;
           let channel = req.body.event.channel;
           let type = req.body.event.type;
          if (type !== "message") {
            return;
          }
          if (text !== undefined) {
            if (channel === "C0139RJPUEM" && text.includes("Referral ")) {
           splitText = text.split(" ");
           //console.log("this is splitText", splitText);
           let emailIndex = splitText.indexOf("the");
           //console.log("this is emailIndex", emailIndex);
           let checkIndex = splitText.indexOf("details:\n*User:*");
           //console.log("this is checkIndex", checkIndex);
  
           let newEmailIndex = emailIndex + 1;
           //console.log("this is newEmailIndex", newEmailIndex);
           let email = splitText[newEmailIndex];
           //console.log("this is email", email);
           let newEmail = email.slice(25, email.length - 11);
           //console.log("this is newEmail", newEmail);
           if (checkIndex !== -1) {
             newEmailIndex = checkIndex + 1;
             //console.log("this is newEmailIndex updated", newEmailIndex);
             email = splitText[newEmailIndex];
             //console.log("this is email updated", email);
             newEmail = email.slice(8, email.length - 11);
             //console.log("this is newEmail updated", newEmail);
           }
           //console.log("this is newEmailIndex", newEmailIndex);
           let checkIndex2 = splitText.indexOf("Amount:*");
           //console.log("this is checkIndex2", checkIndex2);
           let checkIndex3 = splitText.indexOf("ID:*");
           //console.log("This is checkIndex3", checkIndex3);
           let newOrderNumberIndex = splitText.length - 3;
           //console.log("this is newOrderNumberIndex", newOrderNumberIndex);
           let orderNumber = splitText[newOrderNumberIndex];
           //console.log("this is orderNumber", orderNumber);
           let newOrderNumber = orderNumber.slice(5, 12);
           //console.log("this is newerOrderNumber", newOrderNumber);
           if (checkIndex3 !== -1) {
             newOrderNumberIndex = checkIndex3 + 1;
             //console.log("this is newOrderNumberIndex", newOrderNumberIndex);
             orderNumber = splitText[newOrderNumberIndex];
             //console.log("this is orderNumber", orderNumber);
             newOrderNumber = orderNumber.slice(0, 7);
             //console.log("this is newerOrderNumber", newOrderNumber);
           } else if (checkIndex2 !== -1) {
             newOrderNumberIndex = splitText.length - 5;
             //console.log("this is newOrderNumberIndex", newOrderNumberIndex);
             orderNumber = splitText[newOrderNumberIndex];
             //console.log("this is orderNumber", orderNumber);
             newOrderNumber = orderNumber.slice(0, 7);
             //console.log("this is newerOrderNumber", newOrderNumber);
           }
  
           let newerEmail = newEmail.slice(newEmail.length / 2 + 1);
           //console.log("this is newerEmail", newerEmail);
           axios
             .get(
               `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${newOrderNumber}`,
               config
             )
             .then(function (response) {
               // handle success
               if (response.data !== []) {
                       let nowMonth =
                         Number(moment().subtract(6, "hours").month()) + 1;
                       let nowYear = Number(moment().subtract(6, "hours").year());
                       let prevYear = Number(
                         moment().subtract(6, "hours").year()
                       );
                       let nowDay = Number(moment().subtract(6, "hours").date());
                       let hour = Number(moment().subtract(6, "hours").hour());
                       let min = Number(moment().subtract(6, "hours").minute());
                       let sec = Number(moment().subtract(6, "hours").second());
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
                        let AmPm = "AM";
                        if (normalHour > 12) {
                          AmPm = "PM";
                          normalHour = normalHour - 12;
                        } else if (normalHour === 12) {
                          AmPm = "PM";
                        } else if (normalHour === 00) {
                          AmPm = "AM";
                          normalHour = 12;
                        }
                 //console.log(response.data);
                 //console.log(response.data.date_created);
                 let created_at = `${nowMonth}/${nowDay}/${nowYear} ${normalHour}:${min}:${sec}${AmPm}`;
                 //console.log(response.data.subtotal_ex_tax);
                 let order_total = response.data.subtotal_ex_tax;
                 axios
                   .get(
                     `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${newOrderNumber}/products`,
                     config
                   )
                   .then(function (response) {
                     // handle success
                     if (response.data !== []) {
                       
                       let titleString = `  <div><img
                     src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/177x60/htwlogo_web_1573140308__59565.original.png"
                     width="150"
                     /></div>
                       <div style="color:black; padding-left: 30px; background-color:#DCDCDC; font-family:Arial Narrow, sans-serif; opacity:0.5;"><i>The following are the order details for your recent sale</div>
                        <table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;"><tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Order number:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${newOrderNumber} </td></tr>`;
                       let array = response.data;
                       let newArray = [];
                       let optionsArray = [];
                       for (let index = 0; index < array.length; index++) {
                         const element = array[index];
                         newArray.push(`<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Item</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${
                           index + 1
                         }</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Item Name:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${
                           element.name
                         }</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">SKU Number:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${
                           element.sku
                         }</td></tr>`);
                         sku = element.sku;
                         name = element.name;
                         let options = element.product_options;
                         const query2Text =
                           'INSERT INTO "sku" (email, order_number, sku, description, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id';
                         pool.query(query2Text, [
                           newerEmail,
                           newOrderNumber,
                           sku,
                           name,
                           created_at,
                         ]);
                         for (let j = 0; j < options.length; j++) {
                           const opt = options[j];
                           optionsArray.push(
                             `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${opt.display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                           );
                         }
                         let optionsJoined = optionsArray.join("");
                         newArray.push(optionsJoined);
                         newArray.push(
                           "</table><br><br><br>"
                         );
                         optionsArray = [];
                         qty = array.length;
                       }
                       let joinedArray = newArray.join("");
                       let finalArray = titleString + joinedArray;
                       //console.log(finalArray);
                       const queryText =
                         'INSERT INTO "affiliate" (email, order_number, order_total, qty, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id';
                       pool
                         .query(queryText, [
                           newerEmail,
                           newOrderNumber,
                           order_total,
                           qty,
                           created_at,
                         ])
  
                         .catch(function (error) {
                           console.log("Sorry, there is an error", error);
                           res.sendStatus(500);
                         });
                       const msg = {
                         personalizations: [
                           {
                             to: [
                               {
                                 email: newerEmail,
                               },
                             ],
                            //  bcc: [
                            //    {
                            //      email: "developer@heattransferwarehouse.com",
                            //    },
                            //  ],
                           },
                         ],
                         from: "sales@heattransferwarehouse.com", // Use the email address or domain you verified above
                         subject: `Sale details for order ${newOrderNumber}`,
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
                      (async () => {
                        // See: https://api.slack.com/methods/chat.postMessage
                        const res = await web.chat.postMessage({
                          icon_emoji: ":email:",
                          channel: conversationId,
                          text:
                            `Order details have been emailed to ${newerEmail}! Wally B out!`,
                        });
  
                        // `res` contains information about the posted message
  
                        console.log("Email Message sent to Affiliate");
                      })();
                  
                   })
                   .catch(function (error) {
                     // handle error
                     console.log(error);
                      (async () => {
                        // See: https://api.slack.com/methods/chat.postMessage
                        const res = await web.chat.postMessage({
                          icon_emoji: ":email:",
                          channel: conversationId,
                          text: `Email failed to send, please contact web support! Wally B out!`,
                        });
  
                        // `res` contains information about the posted message
  
                        console.log("Email Message sent to Affiliate");
                      })();
                   });
               }
             })
             .catch(function (error) {
               // handle error
               console.log(error);
             });
        
      } else {
        return;
      }
     }
    }
});

const token = process.env.SLACK_TOKEN;
  
const web = new WebClient(token);
  
const conversationId = "C0139RJPUEM";
  
const PORT = process.env.PORT || 8000;

// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error);  
  
router.get("/itemlist", (req, res) => {
    console.log("We are about to get the affiliate list");
  
    const queryText = `select * from "affiliate" ORDER BY id DESC`;
    pool
      .query(queryText)
      .then((result) => {
        res.send(result.rows);
      })
      .catch((error) => {
        console.log(`Error on affiliate query ${error}`);
        res.sendStatus(500);
      });
});
  
router.get("/topfive", (req, res) => {
    console.log("We are about to get the affiliate list");
  
    const queryText = `SELECT array_agg(DISTINCT email) as email, count(*)
  FROM sku where "created_at" <= '${dateNow}' AND "created_at" >= '${dateThen}' GROUP BY email ORDER BY count DESC LIMIT 5`;
    pool
      .query(queryText)
      .then((result) => {
        console.log("top five", result.rows)
        res.send(result.rows);
      })
      .catch((error) => {
        console.log(`Error on affiliate query ${error}`);
        res.sendStatus(500);
      });
});
  
router.get("/total", (req, res) => {
    console.log("We are about to get the affiliate list");
  
    const queryText = `SELECT array_agg(DISTINCT email) as email, COUNT(*) FROM sku GROUP BY email;`;
    pool
      .query(queryText)
      .then((result) => {
        res.send(result.rows);
      })
      .catch((error) => {
        console.log(`Error on affiliate query ${error}`);
        res.sendStatus(500);
      });
});
  
router.post("/checkemail", (req, res) => {
    let skuinfo = req.body; 
        let {
        email,
        startDate,
        endDate,
      } = skuinfo;
  
      let newStartDate = `${startDate.year}-${startDate.month}-${startDate.day}`
      let newEndDate = `${endDate.year}-${endDate.month}-${endDate.day}`
        const queryText =
          "SELECT array_agg(DISTINCT sku) as sku, array_agg(DISTINCT description) as description, COUNT(*) FROM sku where email=$1 AND created_at>=$2 AND created_at<=$3 GROUP BY sku;";
        pool
          .query(queryText, [email, newStartDate, newEndDate])
          .then((result) => {
            res.send(result.rows);
          })
          .catch((error) => {
            console.log(`Error on affiliate query ${error}`);
            res.sendStatus(500);
          });
});
  
router.post("/orderdetails", (req, res) => {
    let order_number = req.body.order_number;
    //console.log("this is the payload before it reaches the get", order_number);
    axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}/products`,
        config
      )
      .then(function (response) {
        //console.log("this is the response", response.data)  
     
          res.send(response.data);
        })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
});

router.get("/email", (req, res) => {
    console.log("We are about to get the affiliate list");
  
    const queryText = `select array_agg(DISTINCT email) as email from affiliate group by email`;
    pool
      .query(queryText)
      .then((result) => {
        res.send(result.rows);
      })
      .catch((error) => {
        console.log(`Error on affiliate query ${error}`);
        res.sendStatus(500);
      });
});

setInterval(() => {
  console.log("checking date for sales report")
  let dayMonth = moment().subtract(6, "hours").date();
  let month = moment().subtract(6, "hours").month();
  if (dayMonth == 1 && month == 0) {
    console.log("running sales report")
  let finalArray = "";
  let globalJoinedArray = "";
  const queryText = `select "email" from sku where "created_at" >= '2020-12-01' AND "created_at" <= '2020-12-31' group by "email"`;
  pool
    .query(queryText)
    .then((result) => {
      let emailArray = result.rows;
      for (let index = 0; index < emailArray.length; index++) {
        let amountTotal = 0;
        let qtyTotal = 1;
        const element = emailArray[index];
        let email = element.email;
        let titleString = `  <div><img
                     src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/177x60/htwlogo_web_1573140308__59565.original.png"
                     width="150"
                     /></div>
                       <div style="color:black; padding-left: 30px; background-color:#DCDCDC; font-family:Arial Narrow, sans-serif; opacity:0.5;"><i>The following is your monthly report for the month of December</div>`;
        const queryText2 = `select "order_number" from sku where "email" = '${email}' AND "created_at" >= '2020-12-01' AND "created_at" <= '2020-12-31' group by "order_number"`;
        pool
          .query(queryText2)
          .then((result2) => {
            let orderArray = result2.rows;
            let newArray = [];
            let optionsArray = [];
            for (let index = 0; index < orderArray.length; index++) {
              qtyTotal += 1;
              console.log("qtyTotal", qtyTotal);
              const element2 = orderArray[index];
              let order_number = element2.order_number;
              axios
                .get(
                  `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}`,
                  config
                )
                .then(function (response) {
                  // handle success
                  if (response.data !== []) {
                    let nowMonth =
                      Number(moment().subtract(6, "hours").month()) + 1;
                    let nowYear = Number(moment().subtract(6, "hours").year());
                    let prevYear = Number(moment().subtract(6, "hours").year());
                    let nowDay = Number(moment().subtract(6, "hours").date());
                    let hour = Number(moment().subtract(6, "hours").hour());
                    let min = Number(moment().subtract(6, "hours").minute());
                    let sec = Number(moment().subtract(6, "hours").second());
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
                    let AmPm = "AM";
                    if (normalHour > 12) {
                      AmPm = "PM";
                      normalHour = normalHour - 12;
                    } else if (normalHour === 12) {
                      AmPm = "PM";
                    } else if (normalHour === 00) {
                      AmPm = "AM";
                      normalHour = 12;
                    }
                    let created_at = `${nowMonth}/${nowDay}/${nowYear} ${normalHour}:${min}:${sec}${AmPm}`;
                    axios
                      .get(
                        `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}/products`,
                        config
                      )
                      .then(function (response) {
                        // handle success
                        if (response.data !== []) {
                          let array = response.data;
                          for (let index = 0; index < array.length; index++) {
                            const element = array[index];
                            newArray.push(`<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;">
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Item Name:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.name}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">SKU Number:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.sku}</td></tr>`);
                            sku = element.sku;
                            name = element.name;
                            base_price = element.base_price;
                            base_price = Number(base_price);
                            amountTotal += base_price;
                            let options = element.product_options;
                            for (let j = 0; j < options.length; j++) {
                              const opt = options[j];
                              optionsArray.push(
                                `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${opt.display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                              );
                            }
                            let optionsJoined = optionsArray.join("");
                            newArray.push(optionsJoined);
                            newArray.push("</table><br><br><br>");
                            qty = array.length;
                          }
                          let joinedArray = newArray.join("");
                          console.log("joinedArray", joinedArray);
                          globalJoinedArray = joinedArray;
                          console.log("globalJoinedArray", globalJoinedArray);
                        }
                      })
                      .then((result3) => {
                        if (
                          element2 === orderArray[orderArray.length - 1]
                        ) {
                          let totalString = `<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;"><tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales for this month</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${qtyTotal}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales in dollars</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${amountTotal}</td></tr></table><br><br>`;
                          finalArray =
                            titleString + totalString + globalJoinedArray;
                          console.log("email", email);
                          console.log("qtyTotalAtEmail", qtyTotal);
                          console.log("finalArray", finalArray);
                          optionsArray = [];
                          const msg = {
                            personalizations: [
                              {
                                to: [
                                  {
                                    email: email,
                                  },
                                ],
                                // bcc: [
                                //   {
                                //     email:
                                //       "developer@heattransferwarehouse.com",
                                //   },
                                // ],
                              },
                            ],
                            from: "sales@heattransferwarehouse.com", // Use the email address or domain you verified above
                            subject: `Monthly sales report for December`,
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
                      });
                  }
                })
                .then((result4) => {})
                .catch(function (error) {
                  // handle error
                  console.log(error);
                });
            }
          })
          .catch((error) => {
            console.log(`Error on affiliate query ${error}`);
            res.sendStatus(500);
          });
      }
    })
    .catch((error) => {
      console.log(`Error on affiliate query ${error}`);
      res.sendStatus(500);
    });
  }
  if (dayMonth == 1 && month == 1) {
    console.log("running sales report")
  let finalArray = "";
  let globalJoinedArray = "";
  const queryText = `select "email" from sku where "created_at" >= '2021-01-01' AND "created_at" <= '2021-01-31' group by "email"`;
  pool
    .query(queryText)
    .then((result) => {
      let emailArray = result.rows;
      for (let index = 0; index < emailArray.length; index++) {
        let amountTotal = 0;
        let qtyTotal = 1;
        const element = emailArray[index];
        let email = element.email;
        let titleString = `  <div><img
                     src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/177x60/htwlogo_web_1573140308__59565.original.png"
                     width="150"
                     /></div>
                       <div style="color:black; padding-left: 30px; background-color:#DCDCDC; font-family:Arial Narrow, sans-serif; opacity:0.5;"><i>The following is your monthly report for the month of January</div>`;
        const queryText2 = `select "order_number" from sku where "email" = '${email}' AND "created_at" >= '2021-01-01' AND "created_at" <= '2021-01-31' group by "order_number"`;
        pool
          .query(queryText2)
          .then((result2) => {
            let orderArray = result2.rows;
            let newArray = [];
            let optionsArray = [];
            for (let index = 0; index < orderArray.length; index++) {
              qtyTotal += 1;
              console.log("qtyTotal", qtyTotal);
              const element2 = orderArray[index];
              let order_number = element2.order_number;
              axios
                .get(
                  `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}`,
                  config
                )
                .then(function (response) {
                  // handle success
                  if (response.data !== []) {
                    let nowMonth =
                      Number(moment().subtract(6, "hours").month()) + 1;
                    let nowYear = Number(moment().subtract(6, "hours").year());
                    let prevYear = Number(moment().subtract(6, "hours").year());
                    let nowDay = Number(moment().subtract(6, "hours").date());
                    let hour = Number(moment().subtract(6, "hours").hour());
                    let min = Number(moment().subtract(6, "hours").minute());
                    let sec = Number(moment().subtract(6, "hours").second());
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
                    let AmPm = "AM";
                    if (normalHour > 12) {
                      AmPm = "PM";
                      normalHour = normalHour - 12;
                    } else if (normalHour === 12) {
                      AmPm = "PM";
                    } else if (normalHour === 00) {
                      AmPm = "AM";
                      normalHour = 12;
                    }
                    let created_at = `${nowMonth}/${nowDay}/${nowYear} ${normalHour}:${min}:${sec}${AmPm}`;
                    axios
                      .get(
                        `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}/products`,
                        config
                      )
                      .then(function (response) {
                        // handle success
                        if (response.data !== []) {
                          let array = response.data;
                          for (let index = 0; index < array.length; index++) {
                            const element = array[index];
                            newArray.push(`<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;">
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Item Name:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.name}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">SKU Number:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.sku}</td></tr>`);
                            sku = element.sku;
                            name = element.name;
                            base_price = element.base_price;
                            base_price = Number(base_price);
                            amountTotal += base_price;
                            let options = element.product_options;
                            for (let j = 0; j < options.length; j++) {
                              const opt = options[j];
                              optionsArray.push(
                                `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${opt.display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                              );
                            }
                            let optionsJoined = optionsArray.join("");
                            newArray.push(optionsJoined);
                            newArray.push("</table><br><br><br>");
                            qty = array.length;
                          }
                          let joinedArray = newArray.join("");
                          console.log("joinedArray", joinedArray);
                          globalJoinedArray = joinedArray;
                          console.log("globalJoinedArray", globalJoinedArray);
                        }
                      })
                      .then((result3) => {
                        if (
                          element2 === orderArray[orderArray.length - 1]
                        ) {
                          let totalString = `<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;"><tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales for this month</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${qtyTotal}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales in dollars</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${amountTotal}</td></tr></table><br><br>`;
                          finalArray =
                            titleString + totalString + globalJoinedArray;
                          console.log("email", email);
                          console.log("qtyTotalAtEmail", qtyTotal);
                          console.log("finalArray", finalArray);
                          optionsArray = [];
                          const msg = {
                            personalizations: [
                              {
                                to: [
                                  {
                                    email: email,
                                  },
                                ],
                                // bcc: [
                                //   {
                                //     email:
                                //       "developer@heattransferwarehouse.com",
                                //   },
                                // ],
                              },
                            ],
                            from: "sales@heattransferwarehouse.com", // Use the email address or domain you verified above
                            subject: `Monthly sales report for January`,
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
                      });
                  }
                })
                .then((result4) => {})
                .catch(function (error) {
                  // handle error
                  console.log(error);
                });
            }
          })
          .catch((error) => {
            console.log(`Error on affiliate query ${error}`);
            res.sendStatus(500);
          });
      }
    })
    .catch((error) => {
      console.log(`Error on affiliate query ${error}`);
      res.sendStatus(500);
    });
  }
  if (dayMonth == 1 && month == 2) {
    console.log("running sales report");
    let finalArray = "";
    let globalJoinedArray = "";
    const queryText = `select "email" from sku where "created_at" >= '2021-02-01' AND "created_at" <= '2021-02-28' group by "email"`;
    pool
      .query(queryText)
      .then((result) => {
        let emailArray = result.rows;
        for (let index = 0; index < emailArray.length; index++) {
          let amountTotal = 0;
          let qtyTotal = 1;
          const element = emailArray[index];
          let email = element.email;
          let titleString = `  <div><img
                     src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/177x60/htwlogo_web_1573140308__59565.original.png"
                     width="150"
                     /></div>
                       <div style="color:black; padding-left: 30px; background-color:#DCDCDC; font-family:Arial Narrow, sans-serif; opacity:0.5;"><i>The following is your monthly report for the month of February</div>`;
          const queryText2 = `select "order_number" from sku where "email" = '${email}' AND "created_at" >= '2021-02-01' AND "created_at" <= '2021-02-28' group by "order_number"`;
          pool
            .query(queryText2)
            .then((result2) => {
              let orderArray = result2.rows;
              let newArray = [];
              let optionsArray = [];
              for (let index = 0; index < orderArray.length; index++) {
                qtyTotal += 1;
                console.log("qtyTotal", qtyTotal);
                const element2 = orderArray[index];
                let order_number = element2.order_number;
                axios
                  .get(
                    `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}`,
                    config
                  )
                  .then(function (response) {
                    // handle success
                    if (response.data !== []) {
                      let nowMonth =
                        Number(moment().subtract(6, "hours").month()) + 1;
                      let nowYear = Number(moment().subtract(6, "hours").year());
                      let prevYear = Number(moment().subtract(6, "hours").year());
                      let nowDay = Number(moment().subtract(6, "hours").date());
                      let hour = Number(moment().subtract(6, "hours").hour());
                      let min = Number(moment().subtract(6, "hours").minute());
                      let sec = Number(moment().subtract(6, "hours").second());
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
                      let AmPm = "AM";
                      if (normalHour > 12) {
                        AmPm = "PM";
                        normalHour = normalHour - 12;
                      } else if (normalHour === 12) {
                        AmPm = "PM";
                      } else if (normalHour === 00) {
                        AmPm = "AM";
                        normalHour = 12;
                      }
                      let created_at = `${nowMonth}/${nowDay}/${nowYear} ${normalHour}:${min}:${sec}${AmPm}`;
                      axios
                        .get(
                          `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}/products`,
                          config
                        )
                        .then(function (response) {
                          // handle success
                          if (response.data !== []) {
                            let array = response.data;
                            for (let index = 0; index < array.length; index++) {
                              const element = array[index];
                              newArray.push(`<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;">
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Item Name:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.name}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">SKU Number:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.sku}</td></tr>`);
                              sku = element.sku;
                              name = element.name;
                              base_price = element.base_price;
                              base_price = Number(base_price);
                              amountTotal += base_price;
                              let options = element.product_options;
                              for (let j = 0; j < options.length; j++) {
                                const opt = options[j];
                                optionsArray.push(
                                  `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${opt.display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                                );
                              }
                              let optionsJoined = optionsArray.join("");
                              newArray.push(optionsJoined);
                              newArray.push("</table><br><br><br>");
                              qty = array.length;
                            }
                            let joinedArray = newArray.join("");
                            console.log("joinedArray", joinedArray);
                            globalJoinedArray = joinedArray;
                            console.log("globalJoinedArray", globalJoinedArray);
                          }
                        })
                        .then((result3) => {
                          if (element2 === orderArray[orderArray.length - 1]) {
                            let totalString = `<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;"><tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales for this month</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${qtyTotal}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales in dollars</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${amountTotal}</td></tr></table><br><br>`;
                            finalArray =
                              titleString + totalString + globalJoinedArray;
                            console.log("email", email);
                            console.log("qtyTotalAtEmail", qtyTotal);
                            console.log("finalArray", finalArray);
                            optionsArray = [];
                            const msg = {
                              personalizations: [
                                {
                                  to: [
                                    {
                                      email: email,
                                    },
                                  ],
                                  // bcc: [
                                  //   {
                                  //     email:
                                  //       "developer@heattransferwarehouse.com",
                                  //   },
                                  // ],
                                },
                              ],
                              from: "sales@heattransferwarehouse.com", // Use the email address or domain you verified above
                              subject: `Monthly sales report for February`,
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
                        });
                    }
                  })
                  .then((result4) => {})
                  .catch(function (error) {
                    // handle error
                    console.log(error);
                  });
              }
            })
            .catch((error) => {
              console.log(`Error on affiliate query ${error}`);
              res.sendStatus(500);
            });
        }
      })
      .catch((error) => {
        console.log(`Error on affiliate query ${error}`);
        res.sendStatus(500);
      });
  }
  if (dayMonth == 1 && month == 3) {
    console.log("running sales report");
    let finalArray = "";
    let globalJoinedArray = "";
    const queryText = `select "email" from sku where "created_at" >= '2021-03-01' AND "created_at" <= '2021-03-31' group by "email"`;
    pool
      .query(queryText)
      .then((result) => {
        let emailArray = result.rows;
        for (let index = 0; index < emailArray.length; index++) {
          let amountTotal = 0;
          let qtyTotal = 1;
          const element = emailArray[index];
          let email = element.email;
          let titleString = `  <div><img
                     src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/177x60/htwlogo_web_1573140308__59565.original.png"
                     width="150"
                     /></div>
                       <div style="color:black; padding-left: 30px; background-color:#DCDCDC; font-family:Arial Narrow, sans-serif; opacity:0.5;"><i>The following is your monthly report for the month of March</div>`;
          const queryText2 = `select "order_number" from sku where "email" = '${email}' AND "created_at" >= '2021-03-01' AND "created_at" <= '2021-03-31' group by "order_number"`;
          pool
            .query(queryText2)
            .then((result2) => {
              let orderArray = result2.rows;
              let newArray = [];
              let optionsArray = [];
              for (let index = 0; index < orderArray.length; index++) {
                qtyTotal += 1;
                console.log("qtyTotal", qtyTotal);
                const element2 = orderArray[index];
                let order_number = element2.order_number;
                axios
                  .get(
                    `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}`,
                    config
                  )
                  .then(function (response) {
                    // handle success
                    if (response.data !== []) {
                      let nowMonth =
                        Number(moment().subtract(6, "hours").month()) + 1;
                      let nowYear = Number(moment().subtract(6, "hours").year());
                      let prevYear = Number(moment().subtract(6, "hours").year());
                      let nowDay = Number(moment().subtract(6, "hours").date());
                      let hour = Number(moment().subtract(6, "hours").hour());
                      let min = Number(moment().subtract(6, "hours").minute());
                      let sec = Number(moment().subtract(6, "hours").second());
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
                      let AmPm = "AM";
                      if (normalHour > 12) {
                        AmPm = "PM";
                        normalHour = normalHour - 12;
                      } else if (normalHour === 12) {
                        AmPm = "PM";
                      } else if (normalHour === 00) {
                        AmPm = "AM";
                        normalHour = 12;
                      }
                      let created_at = `${nowMonth}/${nowDay}/${nowYear} ${normalHour}:${min}:${sec}${AmPm}`;
                      axios
                        .get(
                          `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}/products`,
                          config
                        )
                        .then(function (response) {
                          // handle success
                          if (response.data !== []) {
                            let array = response.data;
                            for (let index = 0; index < array.length; index++) {
                              const element = array[index];
                              newArray.push(`<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;">
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Item Name:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.name}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">SKU Number:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.sku}</td></tr>`);
                              sku = element.sku;
                              name = element.name;
                              base_price = element.base_price;
                              base_price = Number(base_price);
                              amountTotal += base_price;
                              let options = element.product_options;
                              for (let j = 0; j < options.length; j++) {
                                const opt = options[j];
                                optionsArray.push(
                                  `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${opt.display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                                );
                              }
                              let optionsJoined = optionsArray.join("");
                              newArray.push(optionsJoined);
                              newArray.push("</table><br><br><br>");
                              qty = array.length;
                            }
                            let joinedArray = newArray.join("");
                            console.log("joinedArray", joinedArray);
                            globalJoinedArray = joinedArray;
                            console.log("globalJoinedArray", globalJoinedArray);
                          }
                        })
                        .then((result3) => {
                          if (element2 === orderArray[orderArray.length - 1]) {
                            let totalString = `<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;"><tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales for this month</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${qtyTotal}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales in dollars</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${amountTotal}</td></tr></table><br><br>`;
                            finalArray =
                              titleString + totalString + globalJoinedArray;
                            console.log("email", email);
                            console.log("qtyTotalAtEmail", qtyTotal);
                            console.log("finalArray", finalArray);
                            optionsArray = [];
                            const msg = {
                              personalizations: [
                                {
                                  to: [
                                    {
                                      email: email,
                                    },
                                  ],
                                  // bcc: [
                                  //   {
                                  //     email:
                                  //       "developer@heattransferwarehouse.com",
                                  //   },
                                  // ],
                                },
                              ],
                              from: "sales@heattransferwarehouse.com", // Use the email address or domain you verified above
                              subject: `Monthly sales report for March`,
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
                        });
                    }
                  })
                  .then((result4) => {})
                  .catch(function (error) {
                    // handle error
                    console.log(error);
                  });
              }
            })
            .catch((error) => {
              console.log(`Error on affiliate query ${error}`);
              res.sendStatus(500);
            });
        }
      })
      .catch((error) => {
        console.log(`Error on affiliate query ${error}`);
        res.sendStatus(500);
      });
  }
  if (dayMonth == 1 && month == 4) {
    console.log("running sales report");
    let finalArray = "";
    let globalJoinedArray = "";
    const queryText = `select "email" from sku where "created_at" >= '2021-04-01' AND "created_at" <= '2021-04-30' group by "email"`;
    pool
      .query(queryText)
      .then((result) => {
        let emailArray = result.rows;
        for (let index = 0; index < emailArray.length; index++) {
          let amountTotal = 0;
          let qtyTotal = 1;
          const element = emailArray[index];
          let email = element.email;
          let titleString = `  <div><img
                     src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/177x60/htwlogo_web_1573140308__59565.original.png"
                     width="150"
                     /></div>
                       <div style="color:black; padding-left: 30px; background-color:#DCDCDC; font-family:Arial Narrow, sans-serif; opacity:0.5;"><i>The following is your monthly report for the month of April</div>`;
          const queryText2 = `select "order_number" from sku where "email" = '${email}' AND "created_at" >= '2021-04-01' AND "created_at" <= '2021-04-30' group by "order_number"`;
          pool
            .query(queryText2)
            .then((result2) => {
              let orderArray = result2.rows;
              let newArray = [];
              let optionsArray = [];
              for (let index = 0; index < orderArray.length; index++) {
                qtyTotal += 1;
                console.log("qtyTotal", qtyTotal);
                const element2 = orderArray[index];
                let order_number = element2.order_number;
                axios
                  .get(
                    `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}`,
                    config
                  )
                  .then(function (response) {
                    // handle success
                    if (response.data !== []) {
                      let nowMonth =
                        Number(moment().subtract(6, "hours").month()) + 1;
                      let nowYear = Number(moment().subtract(6, "hours").year());
                      let prevYear = Number(moment().subtract(6, "hours").year());
                      let nowDay = Number(moment().subtract(6, "hours").date());
                      let hour = Number(moment().subtract(6, "hours").hour());
                      let min = Number(moment().subtract(6, "hours").minute());
                      let sec = Number(moment().subtract(6, "hours").second());
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
                      let AmPm = "AM";
                      if (normalHour > 12) {
                        AmPm = "PM";
                        normalHour = normalHour - 12;
                      } else if (normalHour === 12) {
                        AmPm = "PM";
                      } else if (normalHour === 00) {
                        AmPm = "AM";
                        normalHour = 12;
                      }
                      let created_at = `${nowMonth}/${nowDay}/${nowYear} ${normalHour}:${min}:${sec}${AmPm}`;
                      axios
                        .get(
                          `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}/products`,
                          config
                        )
                        .then(function (response) {
                          // handle success
                          if (response.data !== []) {
                            let array = response.data;
                            for (let index = 0; index < array.length; index++) {
                              const element = array[index];
                              newArray.push(`<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;">
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Item Name:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.name}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">SKU Number:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.sku}</td></tr>`);
                              sku = element.sku;
                              name = element.name;
                              base_price = element.base_price;
                              base_price = Number(base_price);
                              amountTotal += base_price;
                              let options = element.product_options;
                              for (let j = 0; j < options.length; j++) {
                                const opt = options[j];
                                optionsArray.push(
                                  `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${opt.display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                                );
                              }
                              let optionsJoined = optionsArray.join("");
                              newArray.push(optionsJoined);
                              newArray.push("</table><br><br><br>");
                              qty = array.length;
                            }
                            let joinedArray = newArray.join("");
                            console.log("joinedArray", joinedArray);
                            globalJoinedArray = joinedArray;
                            console.log("globalJoinedArray", globalJoinedArray);
                          }
                        })
                        .then((result3) => {
                          if (element2 === orderArray[orderArray.length - 1]) {
                            let totalString = `<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;"><tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales for this month</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${qtyTotal}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales in dollars</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${amountTotal}</td></tr></table><br><br>`;
                            finalArray =
                              titleString + totalString + globalJoinedArray;
                            console.log("email", email);
                            console.log("qtyTotalAtEmail", qtyTotal);
                            console.log("finalArray", finalArray);
                            optionsArray = [];
                            const msg = {
                              personalizations: [
                                {
                                  to: [
                                    {
                                      email: email,
                                    },
                                  ],
                                  // bcc: [
                                  //   {
                                  //     email:
                                  //       "developer@heattransferwarehouse.com",
                                  //   },
                                  // ],
                                },
                              ],
                              from: "sales@heattransferwarehouse.com", // Use the email address or domain you verified above
                              subject: `Monthly sales report for April`,
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
                        });
                    }
                  })
                  .then((result4) => {})
                  .catch(function (error) {
                    // handle error
                    console.log(error);
                  });
              }
            })
            .catch((error) => {
              console.log(`Error on affiliate query ${error}`);
              res.sendStatus(500);
            });
        }
      })
      .catch((error) => {
        console.log(`Error on affiliate query ${error}`);
        res.sendStatus(500);
      });
  }
  if (dayMonth == 1 && month == 5) {
    console.log("running sales report");
    let finalArray = "";
    let globalJoinedArray = "";
    const queryText = `select "email" from sku where "created_at" >= '2021-05-01' AND "created_at" <= '2021-05-31' group by "email"`;
    pool
      .query(queryText)
      .then((result) => {
        let emailArray = result.rows;
        for (let index = 0; index < emailArray.length; index++) {
          let amountTotal = 0;
          let qtyTotal = 1;
          const element = emailArray[index];
          let email = element.email;
          let titleString = `  <div><img
                     src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/177x60/htwlogo_web_1573140308__59565.original.png"
                     width="150"
                     /></div>
                       <div style="color:black; padding-left: 30px; background-color:#DCDCDC; font-family:Arial Narrow, sans-serif; opacity:0.5;"><i>The following is your monthly report for the month of May</div>`;
          const queryText2 = `select "order_number" from sku where "email" = '${email}' AND "created_at" >= '2021-05-01' AND "created_at" <= '2021-05-31' group by "order_number"`;
          pool
            .query(queryText2)
            .then((result2) => {
              let orderArray = result2.rows;
              let newArray = [];
              let optionsArray = [];
              for (let index = 0; index < orderArray.length; index++) {
                qtyTotal += 1;
                console.log("qtyTotal", qtyTotal);
                const element2 = orderArray[index];
                let order_number = element2.order_number;
                axios
                  .get(
                    `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}`,
                    config
                  )
                  .then(function (response) {
                    // handle success
                    if (response.data !== []) {
                      let nowMonth =
                        Number(moment().subtract(6, "hours").month()) + 1;
                      let nowYear = Number(moment().subtract(6, "hours").year());
                      let prevYear = Number(moment().subtract(6, "hours").year());
                      let nowDay = Number(moment().subtract(6, "hours").date());
                      let hour = Number(moment().subtract(6, "hours").hour());
                      let min = Number(moment().subtract(6, "hours").minute());
                      let sec = Number(moment().subtract(6, "hours").second());
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
                      let AmPm = "AM";
                      if (normalHour > 12) {
                        AmPm = "PM";
                        normalHour = normalHour - 12;
                      } else if (normalHour === 12) {
                        AmPm = "PM";
                      } else if (normalHour === 00) {
                        AmPm = "AM";
                        normalHour = 12;
                      }
                      let created_at = `${nowMonth}/${nowDay}/${nowYear} ${normalHour}:${min}:${sec}${AmPm}`;
                      axios
                        .get(
                          `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}/products`,
                          config
                        )
                        .then(function (response) {
                          // handle success
                          if (response.data !== []) {
                            let array = response.data;
                            for (let index = 0; index < array.length; index++) {
                              const element = array[index];
                              newArray.push(`<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;">
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Item Name:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.name}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">SKU Number:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.sku}</td></tr>`);
                              sku = element.sku;
                              name = element.name;
                              base_price = element.base_price;
                              base_price = Number(base_price);
                              amountTotal += base_price;
                              let options = element.product_options;
                              for (let j = 0; j < options.length; j++) {
                                const opt = options[j];
                                optionsArray.push(
                                  `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${opt.display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                                );
                              }
                              let optionsJoined = optionsArray.join("");
                              newArray.push(optionsJoined);
                              newArray.push("</table><br><br><br>");
                              qty = array.length;
                            }
                            let joinedArray = newArray.join("");
                            console.log("joinedArray", joinedArray);
                            globalJoinedArray = joinedArray;
                            console.log("globalJoinedArray", globalJoinedArray);
                          }
                        })
                        .then((result3) => {
                          if (element2 === orderArray[orderArray.length - 1]) {
                            let totalString = `<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;"><tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales for this month</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${qtyTotal}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales in dollars</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${amountTotal}</td></tr></table><br><br>`;
                            finalArray =
                              titleString + totalString + globalJoinedArray;
                            console.log("email", email);
                            console.log("qtyTotalAtEmail", qtyTotal);
                            console.log("finalArray", finalArray);
                            optionsArray = [];
                            const msg = {
                              personalizations: [
                                {
                                  to: [
                                    {
                                      email: email,
                                    },
                                  ],
                                  // bcc: [
                                  //   {
                                  //     email:
                                  //       "developer@heattransferwarehouse.com",
                                  //   },
                                  // ],
                                },
                              ],
                              from: "sales@heattransferwarehouse.com", // Use the email address or domain you verified above
                              subject: `Monthly sales report for May`,
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
                        });
                    }
                  })
                  .then((result4) => {})
                  .catch(function (error) {
                    // handle error
                    console.log(error);
                  });
              }
            })
            .catch((error) => {
              console.log(`Error on affiliate query ${error}`);
              res.sendStatus(500);
            });
        }
      })
      .catch((error) => {
        console.log(`Error on affiliate query ${error}`);
        res.sendStatus(500);
      });
  }
  if (dayMonth == 1 && month == 6) {
    console.log("running sales report");
    let finalArray = "";
    let globalJoinedArray = "";
    const queryText = `select "email" from sku where "created_at" >= '2021-06-01' AND "created_at" <= '2021-06-30' group by "email"`;
    pool
      .query(queryText)
      .then((result) => {
        let emailArray = result.rows;
        for (let index = 0; index < emailArray.length; index++) {
          let amountTotal = 0;
          let qtyTotal = 1;
          const element = emailArray[index];
          let email = element.email;
          let titleString = `  <div><img
                     src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/177x60/htwlogo_web_1573140308__59565.original.png"
                     width="150"
                     /></div>
                       <div style="color:black; padding-left: 30px; background-color:#DCDCDC; font-family:Arial Narrow, sans-serif; opacity:0.5;"><i>The following is your monthly report for the month of June</div>`;
          const queryText2 = `select "order_number" from sku where "email" = '${email}' AND "created_at" >= '2021-06-01' AND "created_at" <= '2021-06-30' group by "order_number"`;
          pool
            .query(queryText2)
            .then((result2) => {
              let orderArray = result2.rows;
              let newArray = [];
              let optionsArray = [];
              for (let index = 0; index < orderArray.length; index++) {
                qtyTotal += 1;
                console.log("qtyTotal", qtyTotal);
                const element2 = orderArray[index];
                let order_number = element2.order_number;
                axios
                  .get(
                    `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}`,
                    config
                  )
                  .then(function (response) {
                    // handle success
                    if (response.data !== []) {
                      let nowMonth =
                        Number(moment().subtract(6, "hours").month()) + 1;
                      let nowYear = Number(moment().subtract(6, "hours").year());
                      let prevYear = Number(moment().subtract(6, "hours").year());
                      let nowDay = Number(moment().subtract(6, "hours").date());
                      let hour = Number(moment().subtract(6, "hours").hour());
                      let min = Number(moment().subtract(6, "hours").minute());
                      let sec = Number(moment().subtract(6, "hours").second());
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
                      let AmPm = "AM";
                      if (normalHour > 12) {
                        AmPm = "PM";
                        normalHour = normalHour - 12;
                      } else if (normalHour === 12) {
                        AmPm = "PM";
                      } else if (normalHour === 00) {
                        AmPm = "AM";
                        normalHour = 12;
                      }
                      let created_at = `${nowMonth}/${nowDay}/${nowYear} ${normalHour}:${min}:${sec}${AmPm}`;
                      axios
                        .get(
                          `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}/products`,
                          config
                        )
                        .then(function (response) {
                          // handle success
                          if (response.data !== []) {
                            let array = response.data;
                            for (let index = 0; index < array.length; index++) {
                              const element = array[index];
                              newArray.push(`<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;">
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Item Name:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.name}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">SKU Number:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.sku}</td></tr>`);
                              sku = element.sku;
                              name = element.name;
                              base_price = element.base_price;
                              base_price = Number(base_price);
                              amountTotal += base_price;
                              let options = element.product_options;
                              for (let j = 0; j < options.length; j++) {
                                const opt = options[j];
                                optionsArray.push(
                                  `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${opt.display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                                );
                              }
                              let optionsJoined = optionsArray.join("");
                              newArray.push(optionsJoined);
                              newArray.push("</table><br><br><br>");
                              qty = array.length;
                            }
                            let joinedArray = newArray.join("");
                            console.log("joinedArray", joinedArray);
                            globalJoinedArray = joinedArray;
                            console.log("globalJoinedArray", globalJoinedArray);
                          }
                        })
                        .then((result3) => {
                          if (element2 === orderArray[orderArray.length - 1]) {
                            let totalString = `<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;"><tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales for this month</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${qtyTotal}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales in dollars</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${amountTotal}</td></tr></table><br><br>`;
                            finalArray =
                              titleString + totalString + globalJoinedArray;
                            console.log("email", email);
                            console.log("qtyTotalAtEmail", qtyTotal);
                            console.log("finalArray", finalArray);
                            optionsArray = [];
                            const msg = {
                              personalizations: [
                                {
                                  to: [
                                    {
                                      email: email,
                                    },
                                  ],
                                  // bcc: [
                                  //   {
                                  //     email:
                                  //       "developer@heattransferwarehouse.com",
                                  //   },
                                  // ],
                                },
                              ],
                              from: "sales@heattransferwarehouse.com", // Use the email address or domain you verified above
                              subject: `Monthly sales report for June`,
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
                        });
                    }
                  })
                  .then((result4) => {})
                  .catch(function (error) {
                    // handle error
                    console.log(error);
                  });
              }
            })
            .catch((error) => {
              console.log(`Error on affiliate query ${error}`);
              res.sendStatus(500);
            });
        }
      })
      .catch((error) => {
        console.log(`Error on affiliate query ${error}`);
        res.sendStatus(500);
      });
  }
  if (dayMonth == 1 && month == 7) {
    console.log("running sales report");
    let finalArray = "";
    let globalJoinedArray = "";
    const queryText = `select "email" from sku where "created_at" >= '2021-07-01' AND "created_at" <= '2021-07-31' group by "email"`;
    pool
      .query(queryText)
      .then((result) => {
        let emailArray = result.rows;
        for (let index = 0; index < emailArray.length; index++) {
          let amountTotal = 0;
          let qtyTotal = 1;
          const element = emailArray[index];
          let email = element.email;
          let titleString = `  <div><img
                     src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/177x60/htwlogo_web_1573140308__59565.original.png"
                     width="150"
                     /></div>
                       <div style="color:black; padding-left: 30px; background-color:#DCDCDC; font-family:Arial Narrow, sans-serif; opacity:0.5;"><i>The following is your monthly report for the month of July</div>`;
          const queryText2 = `select "order_number" from sku where "email" = '${email}' AND "created_at" >= '2021-07-01' AND "created_at" <= '2021-07-31' group by "order_number"`;
          pool
            .query(queryText2)
            .then((result2) => {
              let orderArray = result2.rows;
              let newArray = [];
              let optionsArray = [];
              for (let index = 0; index < orderArray.length; index++) {
                qtyTotal += 1;
                console.log("qtyTotal", qtyTotal);
                const element2 = orderArray[index];
                let order_number = element2.order_number;
                axios
                  .get(
                    `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}`,
                    config
                  )
                  .then(function (response) {
                    // handle success
                    if (response.data !== []) {
                      let nowMonth =
                        Number(moment().subtract(6, "hours").month()) + 1;
                      let nowYear = Number(moment().subtract(6, "hours").year());
                      let prevYear = Number(moment().subtract(6, "hours").year());
                      let nowDay = Number(moment().subtract(6, "hours").date());
                      let hour = Number(moment().subtract(6, "hours").hour());
                      let min = Number(moment().subtract(6, "hours").minute());
                      let sec = Number(moment().subtract(6, "hours").second());
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
                      let AmPm = "AM";
                      if (normalHour > 12) {
                        AmPm = "PM";
                        normalHour = normalHour - 12;
                      } else if (normalHour === 12) {
                        AmPm = "PM";
                      } else if (normalHour === 00) {
                        AmPm = "AM";
                        normalHour = 12;
                      }
                      let created_at = `${nowMonth}/${nowDay}/${nowYear} ${normalHour}:${min}:${sec}${AmPm}`;
                      axios
                        .get(
                          `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}/products`,
                          config
                        )
                        .then(function (response) {
                          // handle success
                          if (response.data !== []) {
                            let array = response.data;
                            for (let index = 0; index < array.length; index++) {
                              const element = array[index];
                              newArray.push(`<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;">
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Item Name:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.name}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">SKU Number:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.sku}</td></tr>`);
                              sku = element.sku;
                              name = element.name;
                              base_price = element.base_price;
                              base_price = Number(base_price);
                              amountTotal += base_price;
                              let options = element.product_options;
                              for (let j = 0; j < options.length; j++) {
                                const opt = options[j];
                                optionsArray.push(
                                  `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${opt.display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                                );
                              }
                              let optionsJoined = optionsArray.join("");
                              newArray.push(optionsJoined);
                              newArray.push("</table><br><br><br>");
                              qty = array.length;
                            }
                            let joinedArray = newArray.join("");
                            console.log("joinedArray", joinedArray);
                            globalJoinedArray = joinedArray;
                            console.log("globalJoinedArray", globalJoinedArray);
                          }
                        })
                        .then((result3) => {
                          if (element2 === orderArray[orderArray.length - 1]) {
                            let totalString = `<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;"><tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales for this month</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${qtyTotal}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales in dollars</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${amountTotal}</td></tr></table><br><br>`;
                            finalArray =
                              titleString + totalString + globalJoinedArray;
                            console.log("email", email);
                            console.log("qtyTotalAtEmail", qtyTotal);
                            console.log("finalArray", finalArray);
                            optionsArray = [];
                            const msg = {
                              personalizations: [
                                {
                                  to: [
                                    {
                                      email: email,
                                    },
                                  ],
                                  // bcc: [
                                  //   {
                                  //     email:
                                  //       "developer@heattransferwarehouse.com",
                                  //   },
                                  // ],
                                },
                              ],
                              from: "sales@heattransferwarehouse.com", // Use the email address or domain you verified above
                              subject: `Monthly sales report for July`,
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
                        });
                    }
                  })
                  .then((result4) => {})
                  .catch(function (error) {
                    // handle error
                    console.log(error);
                  });
              }
            })
            .catch((error) => {
              console.log(`Error on affiliate query ${error}`);
              res.sendStatus(500);
            });
        }
      })
      .catch((error) => {
        console.log(`Error on affiliate query ${error}`);
        res.sendStatus(500);
      });
  }
  if (dayMonth == 1 && month == 8) {
    console.log("running sales report");
    let finalArray = "";
    let globalJoinedArray = "";
    const queryText = `select "email" from sku where "created_at" >= '2021-08-01' AND "created_at" <= '2021-08-31' group by "email"`;
    pool
      .query(queryText)
      .then((result) => {
        let emailArray = result.rows;
        for (let index = 0; index < emailArray.length; index++) {
          let amountTotal = 0;
          let qtyTotal = 1;
          const element = emailArray[index];
          let email = element.email;
          let titleString = `  <div><img
                     src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/177x60/htwlogo_web_1573140308__59565.original.png"
                     width="150"
                     /></div>
                       <div style="color:black; padding-left: 30px; background-color:#DCDCDC; font-family:Arial Narrow, sans-serif; opacity:0.5;"><i>The following is your monthly report for the month of August</div>`;
          const queryText2 = `select "order_number" from sku where "email" = '${email}' AND "created_at" >= '2021-08-01' AND "created_at" <= '2021-08-31' group by "order_number"`;
          pool
            .query(queryText2)
            .then((result2) => {
              let orderArray = result2.rows;
              let newArray = [];
              let optionsArray = [];
              for (let index = 0; index < orderArray.length; index++) {
                qtyTotal += 1;
                console.log("qtyTotal", qtyTotal);
                const element2 = orderArray[index];
                let order_number = element2.order_number;
                axios
                  .get(
                    `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}`,
                    config
                  )
                  .then(function (response) {
                    // handle success
                    if (response.data !== []) {
                      let nowMonth =
                        Number(moment().subtract(6, "hours").month()) + 1;
                      let nowYear = Number(moment().subtract(6, "hours").year());
                      let prevYear = Number(moment().subtract(6, "hours").year());
                      let nowDay = Number(moment().subtract(6, "hours").date());
                      let hour = Number(moment().subtract(6, "hours").hour());
                      let min = Number(moment().subtract(6, "hours").minute());
                      let sec = Number(moment().subtract(6, "hours").second());
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
                      let AmPm = "AM";
                      if (normalHour > 12) {
                        AmPm = "PM";
                        normalHour = normalHour - 12;
                      } else if (normalHour === 12) {
                        AmPm = "PM";
                      } else if (normalHour === 00) {
                        AmPm = "AM";
                        normalHour = 12;
                      }
                      let created_at = `${nowMonth}/${nowDay}/${nowYear} ${normalHour}:${min}:${sec}${AmPm}`;
                      axios
                        .get(
                          `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}/products`,
                          config
                        )
                        .then(function (response) {
                          // handle success
                          if (response.data !== []) {
                            let array = response.data;
                            for (let index = 0; index < array.length; index++) {
                              const element = array[index];
                              newArray.push(`<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;">
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Item Name:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.name}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">SKU Number:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.sku}</td></tr>`);
                              sku = element.sku;
                              name = element.name;
                              base_price = element.base_price;
                              base_price = Number(base_price);
                              amountTotal += base_price;
                              let options = element.product_options;
                              for (let j = 0; j < options.length; j++) {
                                const opt = options[j];
                                optionsArray.push(
                                  `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${opt.display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                                );
                              }
                              let optionsJoined = optionsArray.join("");
                              newArray.push(optionsJoined);
                              newArray.push("</table><br><br><br>");
                              qty = array.length;
                            }
                            let joinedArray = newArray.join("");
                            console.log("joinedArray", joinedArray);
                            globalJoinedArray = joinedArray;
                            console.log("globalJoinedArray", globalJoinedArray);
                          }
                        })
                        .then((result3) => {
                          if (element2 === orderArray[orderArray.length - 1]) {
                            let totalString = `<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;"><tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales for this month</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${qtyTotal}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales in dollars</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${amountTotal}</td></tr></table><br><br>`;
                            finalArray =
                              titleString + totalString + globalJoinedArray;
                            console.log("email", email);
                            console.log("qtyTotalAtEmail", qtyTotal);
                            console.log("finalArray", finalArray);
                            optionsArray = [];
                            const msg = {
                              personalizations: [
                                {
                                  to: [
                                    {
                                      email: email,
                                    },
                                  ],
                                  // bcc: [
                                  //   {
                                  //     email:
                                  //       "developer@heattransferwarehouse.com",
                                  //   },
                                  // ],
                                },
                              ],
                              from: "sales@heattransferwarehouse.com", // Use the email address or domain you verified above
                              subject: `Monthly sales report for August`,
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
                        });
                    }
                  })
                  .then((result4) => {})
                  .catch(function (error) {
                    // handle error
                    console.log(error);
                  });
              }
            })
            .catch((error) => {
              console.log(`Error on affiliate query ${error}`);
              res.sendStatus(500);
            });
        }
      })
      .catch((error) => {
        console.log(`Error on affiliate query ${error}`);
        res.sendStatus(500);
      });
  }
  if (dayMonth == 1 && month == 9) {
    console.log("running sales report");
    let finalArray = "";
    let globalJoinedArray = "";
    const queryText = `select "email" from sku where "created_at" >= '2021-09-01' AND "created_at" <= '2021-09-30' group by "email"`;
    pool
      .query(queryText)
      .then((result) => {
        let emailArray = result.rows;
        for (let index = 0; index < emailArray.length; index++) {
          let amountTotal = 0;
          let qtyTotal = 1;
          const element = emailArray[index];
          let email = element.email;
          let titleString = `  <div><img
                     src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/177x60/htwlogo_web_1573140308__59565.original.png"
                     width="150"
                     /></div>
                       <div style="color:black; padding-left: 30px; background-color:#DCDCDC; font-family:Arial Narrow, sans-serif; opacity:0.5;"><i>The following is your monthly report for the month of September</div>`;
          const queryText2 = `select "order_number" from sku where "email" = '${email}' AND "created_at" >= '2021-09-01' AND "created_at" <= '2021-09-30' group by "order_number"`;
          pool
            .query(queryText2)
            .then((result2) => {
              let orderArray = result2.rows;
              let newArray = [];
              let optionsArray = [];
              for (let index = 0; index < orderArray.length; index++) {
                qtyTotal += 1;
                console.log("qtyTotal", qtyTotal);
                const element2 = orderArray[index];
                let order_number = element2.order_number;
                axios
                  .get(
                    `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}`,
                    config
                  )
                  .then(function (response) {
                    // handle success
                    if (response.data !== []) {
                      let nowMonth =
                        Number(moment().subtract(6, "hours").month()) + 1;
                      let nowYear = Number(moment().subtract(6, "hours").year());
                      let prevYear = Number(moment().subtract(6, "hours").year());
                      let nowDay = Number(moment().subtract(6, "hours").date());
                      let hour = Number(moment().subtract(6, "hours").hour());
                      let min = Number(moment().subtract(6, "hours").minute());
                      let sec = Number(moment().subtract(6, "hours").second());
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
                      let AmPm = "AM";
                      if (normalHour > 12) {
                        AmPm = "PM";
                        normalHour = normalHour - 12;
                      } else if (normalHour === 12) {
                        AmPm = "PM";
                      } else if (normalHour === 00) {
                        AmPm = "AM";
                        normalHour = 12;
                      }
                      let created_at = `${nowMonth}/${nowDay}/${nowYear} ${normalHour}:${min}:${sec}${AmPm}`;
                      axios
                        .get(
                          `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}/products`,
                          config
                        )
                        .then(function (response) {
                          // handle success
                          if (response.data !== []) {
                            let array = response.data;
                            for (let index = 0; index < array.length; index++) {
                              const element = array[index];
                              newArray.push(`<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;">
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Item Name:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.name}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">SKU Number:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.sku}</td></tr>`);
                              sku = element.sku;
                              name = element.name;
                              base_price = element.base_price;
                              base_price = Number(base_price);
                              amountTotal += base_price;
                              let options = element.product_options;
                              for (let j = 0; j < options.length; j++) {
                                const opt = options[j];
                                optionsArray.push(
                                  `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${opt.display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                                );
                              }
                              let optionsJoined = optionsArray.join("");
                              newArray.push(optionsJoined);
                              newArray.push("</table><br><br><br>");
                              qty = array.length;
                            }
                            let joinedArray = newArray.join("");
                            console.log("joinedArray", joinedArray);
                            globalJoinedArray = joinedArray;
                            console.log("globalJoinedArray", globalJoinedArray);
                          }
                        })
                        .then((result3) => {
                          if (element2 === orderArray[orderArray.length - 1]) {
                            let totalString = `<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;"><tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales for this month</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${qtyTotal}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales in dollars</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${amountTotal}</td></tr></table><br><br>`;
                            finalArray =
                              titleString + totalString + globalJoinedArray;
                            console.log("email", email);
                            console.log("qtyTotalAtEmail", qtyTotal);
                            console.log("finalArray", finalArray);
                            optionsArray = [];
                            const msg = {
                              personalizations: [
                                {
                                  to: [
                                    {
                                      email: email,
                                    },
                                  ],
                                  // bcc: [
                                  //   {
                                  //     email:
                                  //       "developer@heattransferwarehouse.com",
                                  //   },
                                  // ],
                                },
                              ],
                              from: "sales@heattransferwarehouse.com", // Use the email address or domain you verified above
                              subject: `Monthly sales report for September`,
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
                        });
                    }
                  })
                  .then((result4) => {})
                  .catch(function (error) {
                    // handle error
                    console.log(error);
                  });
              }
            })
            .catch((error) => {
              console.log(`Error on affiliate query ${error}`);
              res.sendStatus(500);
            });
        }
      })
      .catch((error) => {
        console.log(`Error on affiliate query ${error}`);
        res.sendStatus(500);
      });
  }
  if (dayMonth == 1 && month == 10) {
    console.log("running sales report");
    let finalArray = "";
    let globalJoinedArray = "";
    const queryText = `select "email" from sku where "created_at" >= '2021-10-01' AND "created_at" <= '2021-10-31' group by "email"`;
    pool
      .query(queryText)
      .then((result) => {
        let emailArray = result.rows;
        for (let index = 0; index < emailArray.length; index++) {
          let amountTotal = 0;
          let qtyTotal = 1;
          const element = emailArray[index];
          let email = element.email;
          let titleString = `  <div><img
                     src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/177x60/htwlogo_web_1573140308__59565.original.png"
                     width="150"
                     /></div>
                       <div style="color:black; padding-left: 30px; background-color:#DCDCDC; font-family:Arial Narrow, sans-serif; opacity:0.5;"><i>The following is your monthly report for the month of October</div>`;
          const queryText2 = `select "order_number" from sku where "email" = '${email}' AND "created_at" >= '2021-10-01' AND "created_at" <= '2021-10-31' group by "order_number"`;
          pool
            .query(queryText2)
            .then((result2) => {
              let orderArray = result2.rows;
              let newArray = [];
              let optionsArray = [];
              for (let index = 0; index < orderArray.length; index++) {
                qtyTotal += 1;
                console.log("qtyTotal", qtyTotal);
                const element2 = orderArray[index];
                let order_number = element2.order_number;
                axios
                  .get(
                    `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}`,
                    config
                  )
                  .then(function (response) {
                    // handle success
                    if (response.data !== []) {
                      let nowMonth =
                        Number(moment().subtract(6, "hours").month()) + 1;
                      let nowYear = Number(moment().subtract(6, "hours").year());
                      let prevYear = Number(moment().subtract(6, "hours").year());
                      let nowDay = Number(moment().subtract(6, "hours").date());
                      let hour = Number(moment().subtract(6, "hours").hour());
                      let min = Number(moment().subtract(6, "hours").minute());
                      let sec = Number(moment().subtract(6, "hours").second());
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
                      let AmPm = "AM";
                      if (normalHour > 12) {
                        AmPm = "PM";
                        normalHour = normalHour - 12;
                      } else if (normalHour === 12) {
                        AmPm = "PM";
                      } else if (normalHour === 00) {
                        AmPm = "AM";
                        normalHour = 12;
                      }
                      let created_at = `${nowMonth}/${nowDay}/${nowYear} ${normalHour}:${min}:${sec}${AmPm}`;
                      axios
                        .get(
                          `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}/products`,
                          config
                        )
                        .then(function (response) {
                          // handle success
                          if (response.data !== []) {
                            let array = response.data;
                            for (let index = 0; index < array.length; index++) {
                              const element = array[index];
                              newArray.push(`<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;">
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Item Name:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.name}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">SKU Number:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.sku}</td></tr>`);
                              sku = element.sku;
                              name = element.name;
                              base_price = element.base_price;
                              base_price = Number(base_price);
                              amountTotal += base_price;
                              let options = element.product_options;
                              for (let j = 0; j < options.length; j++) {
                                const opt = options[j];
                                optionsArray.push(
                                  `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${opt.display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                                );
                              }
                              let optionsJoined = optionsArray.join("");
                              newArray.push(optionsJoined);
                              newArray.push("</table><br><br><br>");
                              qty = array.length;
                            }
                            let joinedArray = newArray.join("");
                            console.log("joinedArray", joinedArray);
                            globalJoinedArray = joinedArray;
                            console.log("globalJoinedArray", globalJoinedArray);
                          }
                        })
                        .then((result3) => {
                          if (element2 === orderArray[orderArray.length - 1]) {
                            let totalString = `<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;"><tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales for this month</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${qtyTotal}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales in dollars</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${amountTotal}</td></tr></table><br><br>`;
                            finalArray =
                              titleString + totalString + globalJoinedArray;
                            console.log("email", email);
                            console.log("qtyTotalAtEmail", qtyTotal);
                            console.log("finalArray", finalArray);
                            optionsArray = [];
                            const msg = {
                              personalizations: [
                                {
                                  to: [
                                    {
                                      email: email,
                                    },
                                  ],
                                  // bcc: [
                                  //   {
                                  //     email:
                                  //       "developer@heattransferwarehouse.com",
                                  //   },
                                  // ],
                                },
                              ],
                              from: "sales@heattransferwarehouse.com", // Use the email address or domain you verified above
                              subject: `Monthly sales report for October`,
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
                        });
                    }
                  })
                  .then((result4) => {})
                  .catch(function (error) {
                    // handle error
                    console.log(error);
                  });
              }
            })
            .catch((error) => {
              console.log(`Error on affiliate query ${error}`);
              res.sendStatus(500);
            });
        }
      })
      .catch((error) => {
        console.log(`Error on affiliate query ${error}`);
        res.sendStatus(500);
      });
  }
  if (dayMonth == 1 && month == 11) {
    console.log("running sales report");
    let finalArray = "";
    let globalJoinedArray = "";
    const queryText = `select "email" from sku where "created_at" >= '2021-11-01' AND "created_at" <= '2021-11-30' group by "email"`;
    pool
      .query(queryText)
      .then((result) => {
        let emailArray = result.rows;
        for (let index = 0; index < emailArray.length; index++) {
          let amountTotal = 0;
          let qtyTotal = 1;
          const element = emailArray[index];
          let email = element.email;
          let titleString = `  <div><img
                     src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/177x60/htwlogo_web_1573140308__59565.original.png"
                     width="150"
                     /></div>
                       <div style="color:black; padding-left: 30px; background-color:#DCDCDC; font-family:Arial Narrow, sans-serif; opacity:0.5;"><i>The following is your monthly report for the month of November</div>`;
          const queryText2 = `select "order_number" from sku where "email" = '${email}' AND "created_at" >= '2021-11-01' AND "created_at" <= '2021-11-30' group by "order_number"`;
          pool
            .query(queryText2)
            .then((result2) => {
              let orderArray = result2.rows;
              let newArray = [];
              let optionsArray = [];
              for (let index = 0; index < orderArray.length; index++) {
                qtyTotal += 1;
                console.log("qtyTotal", qtyTotal);
                const element2 = orderArray[index];
                let order_number = element2.order_number;
                axios
                  .get(
                    `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}`,
                    config
                  )
                  .then(function (response) {
                    // handle success
                    if (response.data !== []) {
                      let nowMonth =
                        Number(moment().subtract(6, "hours").month()) + 1;
                      let nowYear = Number(moment().subtract(6, "hours").year());
                      let prevYear = Number(moment().subtract(6, "hours").year());
                      let nowDay = Number(moment().subtract(6, "hours").date());
                      let hour = Number(moment().subtract(6, "hours").hour());
                      let min = Number(moment().subtract(6, "hours").minute());
                      let sec = Number(moment().subtract(6, "hours").second());
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
                      let AmPm = "AM";
                      if (normalHour > 12) {
                        AmPm = "PM";
                        normalHour = normalHour - 12;
                      } else if (normalHour === 12) {
                        AmPm = "PM";
                      } else if (normalHour === 00) {
                        AmPm = "AM";
                        normalHour = 12;
                      }
                      let created_at = `${nowMonth}/${nowDay}/${nowYear} ${normalHour}:${min}:${sec}${AmPm}`;
                      axios
                        .get(
                          `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}/products`,
                          config
                        )
                        .then(function (response) {
                          // handle success
                          if (response.data !== []) {
                            let array = response.data;
                            for (let index = 0; index < array.length; index++) {
                              const element = array[index];
                              newArray.push(`<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;">
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Item Name:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.name}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">SKU Number:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${element.sku}</td></tr>`);
                              sku = element.sku;
                              name = element.name;
                              base_price = element.base_price;
                              base_price = Number(base_price);
                              amountTotal += base_price;
                              let options = element.product_options;
                              for (let j = 0; j < options.length; j++) {
                                const opt = options[j];
                                optionsArray.push(
                                  `<tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">${opt.display_name}:</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${opt.display_value}</td></tr>`
                                );
                              }
                              let optionsJoined = optionsArray.join("");
                              newArray.push(optionsJoined);
                              newArray.push("</table><br><br><br>");
                              qty = array.length;
                            }
                            let joinedArray = newArray.join("");
                            console.log("joinedArray", joinedArray);
                            globalJoinedArray = joinedArray;
                            console.log("globalJoinedArray", globalJoinedArray);
                          }
                        })
                        .then((result3) => {
                          if (element2 === orderArray[orderArray.length - 1]) {
                            let totalString = `<table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;"><tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales for this month</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${qtyTotal}</td></tr>
                          <tr><td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Total sales in dollars</td><td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${amountTotal}</td></tr></table><br><br>`;
                            finalArray =
                              titleString + totalString + globalJoinedArray;
                            console.log("email", email);
                            console.log("qtyTotalAtEmail", qtyTotal);
                            console.log("finalArray", finalArray);
                            optionsArray = [];
                            const msg = {
                              personalizations: [
                                {
                                  to: [
                                    {
                                      email: email,
                                    },
                                  ],
                                  // bcc: [
                                  //   {
                                  //     email:
                                  //       "developer@heattransferwarehouse.com",
                                  //   },
                                  // ],
                                },
                              ],
                              from: "sales@heattransferwarehouse.com", // Use the email address or domain you verified above
                              subject: `Monthly sales report for November`,
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
                        });
                    }
                  })
                  .then((result4) => {})
                  .catch(function (error) {
                    // handle error
                    console.log(error);
                  });
              }
            })
            .catch((error) => {
              console.log(`Error on affiliate query ${error}`);
              res.sendStatus(500);
            });
        }
      })
      .catch((error) => {
        console.log(`Error on affiliate query ${error}`);
        res.sendStatus(500);
      });
  }
}, 1000 * 60 * 60 * 12);
       



module.exports = router;