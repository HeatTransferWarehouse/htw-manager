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

const { Logtail } = require("@logtail/node");

const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);
const conversationId = "C0139RJPUEM";


let dateNow = moment().subtract(1, "days").format('YYYY-MM-DD')
let dateThen = moment().subtract(31, "days").format("YYYY-MM-DD");
let daterange = moment().subtract(6, "hours").subtract(1, "years");

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

slackEvents.on('error', console.error);  


router.delete("/deleteitemrange", (req, res) => {
    pool
      .query('DELETE FROM "affiliate" WHERE created_at<=$1', [daterange])
      .then((result) => {
        res.sendStatus(204); //No Content
      })
      .catch((error) => {
        logtail.error("--AFFILIATES-- Error DELETE ", error);
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
        logtail.error("--AFFILIATES-- Error DELETE ", error);
        res.sendStatus(500);
      });
});
  
router.post("/events", async (req, res) => {
      if (req.body.challenge) {
      res.status(200).send(req.body.challenge);
      logtail.info("--AFFILIATES-- Verifying challenge..");
      } else {
           res.sendStatus(200);
           let text = req.body.event.text;
           let channel = req.body.event.channel;
           let type = req.body.event.type;
           let user = req.body.event.user;
          if (type === "app_mention" && user !== undefined && channel !== undefined && text.includes("Hey")) {
            (async () => {
              // See: https://api.slack.com/methods/chat.postMessage
              const res = await web.chat.postMessage({
                icon_emoji: ":smile:",
                channel: channel,
                text: `Oh hey <@${user}>! What's Poppin?`,
              });
    
              // `res` contains information about the posted message
    
              logtail.info("--AFFILIATES-- Message sent..");
            })();
          } else if (type === "message") {
            if (text !== undefined && channel === "C0139RJPUEM" && text.includes("Referral ")) {
           const splitText = text.split(" ");
           let emailIndex = splitText.indexOf("the");
           let checkIndex = splitText.indexOf("details:\n*User:*");
           let newEmailIndex = emailIndex + 1;
           let email = splitText[newEmailIndex];
           let newEmail = email.slice(25, email.length - 11);

           if (checkIndex !== -1) {
             newEmailIndex = checkIndex + 1;
             email = splitText[newEmailIndex];
             newEmail = email.slice(8, email.length - 11);
           }

           let checkIndex2 = splitText.indexOf("Amount:*");
           let checkIndex3 = splitText.indexOf("ID:*");
           let newOrderNumberIndex = splitText.length - 3;
           let orderNumber = splitText[newOrderNumberIndex];
           let newOrderNumber = orderNumber.slice(5, 12);

           if (checkIndex3 !== -1) {

             newOrderNumberIndex = checkIndex3 + 1;
             orderNumber = splitText[newOrderNumberIndex];
             newOrderNumber = orderNumber.slice(0, 7);

           } else if (checkIndex2 !== -1) {

             newOrderNumberIndex = splitText.length - 5;
             orderNumber = splitText[newOrderNumberIndex];
             newOrderNumber = orderNumber.slice(0, 7);

           }
  
           let newerEmail = newEmail.slice(newEmail.length / 2 + 1);

           axios
             .get(
               `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${newOrderNumber}`,
               config
             )
             .then(function (response) {
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

                 let created_at = `${nowMonth}/${nowDay}/${nowYear} ${normalHour}:${min}:${sec}${AmPm}`;
                 let order_total = response.data.subtotal_ex_tax;

                 axios
                   .get(
                     `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${newOrderNumber}/products`,
                     config
                   )
                   .then(function (response) {
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
                         let sku = element.sku;
                         let name = element.name;
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
                       //logtail.info(finalArray);
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
                           logtail.info("--AFFILIATES-- Sorry, there is an error", error);
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
  
                        logtail.info("--AFFILIATES-- Email Message sent to Affiliate");
                      })();
                  
                   })
                   .catch(function (error) {
                     // handle error
                     logtail.info(error);
                      (async () => {
                        // See: https://api.slack.com/methods/chat.postMessage
                        const res = await web.chat.postMessage({
                          icon_emoji: ":email:",
                          channel: conversationId,
                          text: `Email failed to send, please contact web support! Wally B out!`,
                        });
  
                        // `res` contains information about the posted message
  
                        logtail.info("--AFFILIATES-- Email Message sent to Affiliate");
                      })();
                   });
               }
             })
             .catch(function (error) {
               // handle error
               logtail.error('--AFFILIATES-- ERROR: ', error);
             });
        
      } else {
        //logtail.info('No Events Matched!');
        return;
      }
     }
    }
});
  
router.get("/itemlist", (req, res) => {
    logtail.info("--AFFILIATES-- We are about to get the affiliate list");
  
    const queryText = `select * from "affiliate" ORDER BY id DESC`;
    pool
      .query(queryText)
      .then((result) => {
        res.send(result.rows);
      })
      .catch((error) => {
        logtail.error(`--AFFILIATES-- Error on affiliate query ${error}`);
        res.sendStatus(500);
      });
});
  
router.get("/topfive", (req, res) => {
    //logtail.info("--AFFILIATES-- We are about to get the affiliate list");
  
    const queryText = `SELECT array_agg(DISTINCT email) as email, count(*)
  FROM sku where "created_at" <= '${dateNow}' AND "created_at" >= '${dateThen}' GROUP BY email ORDER BY count DESC LIMIT 5`;
    pool
      .query(queryText)
      .then((result) => {
        //logtail.info("top five", result.rows)
        res.send(result.rows);
      })
      .catch((error) => {
        logtail.error(`--AFFILIATES-- Error on affiliate query ${error}`);
        res.sendStatus(500);
      });
});
  
router.get("/total", (req, res) => {
    //logtail.info("--AFFILIATES-- We are about to get the affiliate list");
  
    const queryText = `SELECT array_agg(DISTINCT email) as email, COUNT(*) FROM sku GROUP BY email;`;
    pool
      .query(queryText)
      .then((result) => {
        res.send(result.rows);
      })
      .catch((error) => {
        logtail.error(`--AFFILIATES-- Error on affiliate query ${error}`);
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
            logtail.error(`--AFFILIATES-- Error on affiliate query ${error}`);
            res.sendStatus(500);
          });
});
  
router.post("/orderdetails", (req, res) => {
    let order_number = req.body.order_number;
    //logtail.info("this is the payload before it reaches the get", order_number);
    axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order_number}/products`,
        config
      )
      .then(function (response) {
        //logtail.info("this is the response", response.data)  
     
          res.send(response.data);
        })
      .catch(function (error) {
        // handle error
        logtail.error(error);
      })
});

router.get("/email", (req, res) => {
    //logtail.info("--AFFILIATES-- We are about to get the affiliate list");
  
    const queryText = `select array_agg(DISTINCT email) as email from affiliate group by email`;
    pool
      .query(queryText)
      .then((result) => {
        res.send(result.rows);
      })
      .catch((error) => {
        logtail.error(`--AFFILIATES-- Error on affiliate query ${error}`);
        res.sendStatus(500);
      });
});

router.put("/wallyBMessages", (req, res) => {
  logtail.info("--WALLY B-- We are about to send a slack message");

  const payload = req.body;

  const channel = payload.channel;
  const message = payload.message;

    (async () => {
      // See: https://api.slack.com/methods/chat.postMessage
      const res = await web.chat.postMessage({
        icon_emoji: ":smile:",
        channel: channel,
        text: message,
      });

      // `res` contains information about the posted message

      logtail.error("--WALLY B-- Message sent..");
    })();

  res.sendStatus(200);

});



module.exports = router;