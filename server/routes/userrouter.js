const express = require("express");
const {
  rejectUnauthenticated,
} = require("../modules/authentication-middleware");
const encryptLib = require("../modules/encryption");
const pool = require("../modules/pool");
const userStrategy = require("../strategies/user.strategy");
const router = express.Router();
const axios = require("axios");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
require("dotenv").config();
const app = express();
const cors = require('cors');

app.use(cors({
  origin: ['https://www.heattransferwarehouse.com']
}));

let storeHash = process.env.STORE_HASH

//BigCommerce API tokens and keys
let config = {
  headers: {
    "X-Auth-Client": process.env.BG_AUTH_CLIENT,
    "X-Auth-Token": process.env.BG_AUTH_TOKEN,
  },
};

// Handles Ajax request for user information if user is authenticated
router.get("/", rejectUnauthenticated, (req, res) => {
  // Send back user object from the session (previously queried from the database)
  res.send(req.user);
});

router.post("/addadmin", rejectUnauthenticated, (req, res) => {
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

router.post('/register', (req, res) => {
  const username = req.body.username;
  const password = encryptLib.encryptPassword(req.body.password);

  const queryText = `INSERT INTO "user" (email, password, join_date, access_level)
    VALUES ($1, $2, NOW(), 0) RETURNING id`;
  pool
    .query(queryText, [username, password])
    .then(() => res.sendStatus(201))
    .catch((err) => {
      console.log('User registration failed: ', err);
      res.sendStatus(500);
    });
});

router.post("/inksoft", cors(), async function (req, res) {
  const orderId = req.body.orderId;
  console.log('Fetching products for inksoft: ', orderId);

  let inksoft = await axios
    .get(
      `https://api.bigcommerce.com/stores/${storeHash}/v2/orders/${orderId}/products`,
      config
    )

  console.log(`SENDING BACK TO SITE: ${inksoft.data} WITH STATUS: ${inksoft.status}`);
  res.send(inksoft.data).status(inksoft.status);

  inksoft = inksoft.data;


    console.log('Get Products: ', inksoft);

    let designsToSend = [];
    let inksoftCart = [];
    let mainToken = inksoft[0].product_options[1].value;
    let currentCart = [];

    for (const i of inksoft) {

        let inksoftToken = i.product_options[1].value;
        let inksoftName = i.product_options[2].value;
        let quantity = i.quantity;

        console.log('Token and Name: ', inksoftToken, inksoftName);

            inksoftCart = await axios
            .get(
              `https://stores.inksoft.com/DS350156262/Api2/GetCartPackage?SessionToken=${inksoftToken}&Format=JSON`,
              config
            )

        currentCart = inksoftCart.data.Data;
        console.log('Get Cart: ', currentCart);

        let inksoftItems = currentCart.Cart.Items;
        let inksoftDesigns = currentCart.DesignSummaries;
        let linkedId = 0;
        let foundDesign = {};
        let newName = "";

        for (const d of inksoftDesigns) {
            if (d.Name === inksoftName) {
                linkedId = d.DesignID;
                newName = `${d.Name} || ${orderId}`;
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
            foundDesign.FullName = newName;
            foundDesign.Notes = orderId;
            designsToSend.push(foundDesign);
        }
    }

    if (designsToSend === []) {
        return;
    } else {

        console.log('New Designs: ', designsToSend);

        currentCart.Cart.Items = designsToSend;

        let shippingMethods = [];


        try {

            shippingMethods = await axios
            .get(
              `https://stores.inksoft.com/DS350156262/Api2/GetShippingMethods?SessionToken=${mainToken}&Format=JSON&StoreId=296924`,
              config
            )

            shippingMethods = shippingMethods.data.Data[0];
            console.log('Get Ship Methods', shippingMethods);

        } catch (err) {
            console.log('Error on Get Shipping: ', err);
            if (err.response.data.Messages) {
                console.log('Get Shipping Error Messgae: ', err.response.data.Messages);
            }
            if (err.responseText) {
            console.log('Get Shipping Error Messgae: ', err.responseText);
            }
        }


        currentCart.Cart.ShippingMethod = shippingMethods;
        currentCart.Cart.GuestEmail = '';

        console.log('New Cart Before Send: ', currentCart);

        let newCart = JSON.stringify(currentCart.Cart);
        let newNewCart = newCart.replace(/"/g, "'");


        try {

          config = {
            data: `Cart=${newNewCart}&Format=JSON&SessionToken=${mainToken}&StoreId=296924`,
            headers: {
              "X-Auth-Client": process.env.BG_AUTH_CLIENT,
              "X-Auth-Token": process.env.BG_AUTH_TOKEN,
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/x-www-form-urlencoded"
            },
          };

            await axios
            .post(
              `https://stores.inksoft.com/DS350156262/Api2/SetCart`,
              config
            )

            console.log('Cart Modified..');

        } catch (err) {
            console.log('Error on Set Cart: ', err);
            if (err.response.data.Messages) {
                console.log('Set Cart Error Messgae: ', err.response.data.Messages);
            }
            if (err.responseText) {
            console.log('Set Cart Error Messgae: ', err.responseText);
            }
        }

        try {

          config = {
            data: `ExternalOrderId=${orderId}&PurchaseOrderNumber=${orderId}&SessionToken=${mainToken}&Email=${email}&StoreId=296924&FileData=${fileData}&IgnoreTotalDueCheck=true`,
            headers: {
              "X-Auth-Client": process.env.BG_AUTH_CLIENT,
              "X-Auth-Token": process.env.BG_AUTH_TOKEN,
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/x-www-form-urlencoded"
            },
          };

            const fileData = 'file';

            await axios
            .post(
              `https://stores.inksoft.com/DS350156262/Api2/SaveCartOrder`,
              config
            )

            console.log('Order Sent!');

        } catch (err) {
            console.log('Error on Post Cart: ', err);
            if (err.responseText) {
            console.log('Post Cart Error Messgae: ', err.responseText);
            }
        }
    }

});



module.exports = router;
