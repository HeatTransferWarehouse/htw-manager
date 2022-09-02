const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();
const app = express();
const cors = require('cors');

const { Logtail } = require("@logtail/node");

const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

app.use(cors({
  origin: ['https://www.heattransferwarehouse.com']
}));

const {
  updateNote,
  getSO,
} = require('./Capture/api');

const storeHash = process.env.STORE_HASH;

const createNote = async (e, n) => {
  logtail.info('--INKSOFT-- Updating Note on BP...');
  await updateNote(e, n);
  logtail.info('--INKSOFT-- Note Updated..');
};

const inksoftSender = async (orderId, inksoft) => {

  logtail.info('--INKSOFT-- Fetching order for inksoft: ', orderId);

  let config = {
    headers: {
      "X-Auth-Client": process.env.BG_AUTH_CLIENT,
      "X-Auth-Token": process.env.BG_AUTH_TOKEN,
    }
  };

  let newOrder = await axios
    .get(
      `https://api.bigcommerce.com/stores/${storeHash}/v2/orders/${orderId}`,
      config
    )

  newOrder = newOrder.data;

  //logtail.info('--INKSOFT-- New Order Data: ', inksoft);

  const email = newOrder.billing_address.email;

    let designsToSend = [];
    let inksoftCart = [];
    let mainToken = inksoft[0].product_options[1].value;
    let currentCart = [];

    for (const i of inksoft) {

      let sku = i.sku;
      const skuSlice = sku.slice(0, 7);

      if (skuSlice === 'INKSOFT') {

        config = {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/x-www-form-urlencoded"
            },
          };

        mainToken = i.product_options[1].value;
        let inksoftName = i.product_options[2].value;
        let quantity = i.quantity;

        logtail.info('--INKSOFT-- Token and Name: ', mainToken, inksoftName);

            inksoftCart = await axios
            .get(
              `https://stores.inksoft.com/DS350156262/Api2/GetCartPackage?SessionToken=${mainToken}&Format=JSON`,
              config
            )

        currentCart = inksoftCart.data.Data;
        //logtail.info('--INKSOFT-- Get Cart: ', currentCart);

        let inksoftItems = currentCart.Cart.Items;
        let inksoftDesigns = currentCart.DesignSummaries;
        let linkedId = 0;
        let foundDesign = {};
        let alreadyFound = false;
        let newName = "";

        for (const d of inksoftDesigns) {
            if (d.Name === inksoftName) {
                linkedId = d.DesignID;
                newName = `${d.Name} || ${orderId}`;
            }
        }

        if (linkedId === 0) {
        } else {
            for (const i of inksoftItems) {
                if (i.DesignId === linkedId) {
                    foundDesign = i;
                }
            }
        }

        for (const f of designsToSend) {
          if (f.DesignId === foundDesign.DesignId) {
            alreadyFound = true;
          }
        }

        if (foundDesign === {} || alreadyFound) {
        } else {
            foundDesign.Quantity = quantity;
            foundDesign.FullName = newName;
            foundDesign.Notes = orderId;
            designsToSend.push(foundDesign);
        }
    }
  }

    if (designsToSend === []) {
    } else {

        config = {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/x-www-form-urlencoded"
            },
          };

        //logtail.info('--INKSOFT-- New Designs: ', designsToSend);

        currentCart.Cart.Items = designsToSend;

        let shippingMethods = [];


        //try {

            shippingMethods = await axios
            .get(
              `https://stores.inksoft.com/DS350156262/Api2/GetShippingMethods?SessionToken=${mainToken}&Format=JSON&StoreId=296924`,
              config
            )

            shippingMethods = shippingMethods.data.Data[0];
            //logtail.info('--INKSOFT-- Get Ship Methods', shippingMethods);

        // } catch (err) {
        //     logtail.info('--INKSOFT-- Error on Get Shipping: ', err);
        //     if (err.response.data.Messages) {
        //         logtail.info('--INKSOFT-- Get Shipping Error Messgae: ', err.response.data.Messages);
        //     }
        //     if (err.responseText) {
        //     logtail.info('--INKSOFT-- Get Shipping Error Messgae: ', err.responseText);
        //     }
        // }


        currentCart.Cart.ShippingMethod = shippingMethods;
        currentCart.Cart.GuestEmail = '';

        let newCart = JSON.stringify(currentCart.Cart);
        let newNewCart = newCart.replace(/"/g, "'");

        //logtail.info('--INKSOFT-- New Cart Before Send: ', newNewCart);


        //try {

          const data1 = `Cart=${newNewCart}&Format=JSON&SessionToken=${mainToken}&StoreId=296924`;

            await axios
            .post(
              `https://stores.inksoft.com/DS350156262/Api2/SetCart`,
              data1,
              config
            )

            logtail.info('--INKSOFT-- Cart Modified..');

        // } catch (err) {
        //     logtail.info('--INKSOFT-- Error on Set Cart: ', err);
        //     if (err.response.data.Messages) {
        //         logtail.info('--INKSOFT-- Set Cart Error Messgae: ', err.response.data.Messages);
        //     }
        //     if (err.responseText) {
        //     logtail.info('--INKSOFT-- Set Cart Error Messgae: ', err.responseText);
        //     }
        // }

        let newOrder = [];

        //try {

          const fileData = 'file';

          const data2 = `ExternalOrderId=${orderId}&PurchaseOrderNumber=${orderId}&SessionToken=${mainToken}&Email=${email}&StoreId=296924&FileData=${fileData}&IgnoreTotalDueCheck=true`;

          newOrder = await axios
            .post(
              `https://stores.inksoft.com/DS350156262/Api2/SaveCartOrder`,
              data2,
              config
            )

            logtail.info('--INKSOFT-- Order Sent!');

        // } catch (err) {
        //     logtail.info('--INKSOFT-- Error on Post Cart: ', err);
        //     if (err.responseText) {
        //     logtail.info('--INKSOFT-- Post Cart Error Messgae: ', err.responseText);
        //     }
        // }

        const newOrderId = newOrder.data.Data;

        logtail.info('--INKSOFT-- New Order: ', newOrderId);

        //try {
          const so = await getSO(orderId);
          logtail.info('--INKSOFT-- ', so.response.results[0][0]);
          const note = `Inksoft Order Number: ${newOrderId} --- Note made via Admin app. https://admin.heattransferwarehouse.com`;
          await createNote(so.response.results[0][0], note);
        // } catch (err) {
        //   logtail.info('--INKSOFT-- Error on add note: ', err);
        // }
    }
}


router.post("/orders", cors(), async function (req, res) {

  res.sendStatus(200);

//   const headers = req.getHeaders();

//   logtail.info('Headers: ', headers);

  const orderId = req.body.data.id;

  //logtail.info('New Order: ', orderId);

  const config = {
    headers: {
      "X-Auth-Client": process.env.BG_AUTH_CLIENT,
      "X-Auth-Token": process.env.BG_AUTH_TOKEN,
    }
  };

  let inksoft = await axios
  .get(
    `https://api.bigcommerce.com/stores/${storeHash}/v2/orders/${orderId}/products`,
    config
  )

  inksoft = inksoft.data;

  //logtail.info('--INKSOFT-- Get Products: ', inksoft);

  let isInksoft = false;

  for (const i of inksoft) {

    let sku = i.sku;
    const skuSlice = sku.slice(0, 7);

    if (skuSlice === 'INKSOFT') {
      isInksoft = true;
    }

  }

if (isInksoft) {
    try {
        inksoftSender(orderId, inksoft);
    } catch (error) {
        logtail.info('Error on Inksoft Sender: ', error);
    }
}

});

router.post("/register", cors(), async function (req, res) {

    res.sendStatus(200);
  
    const customerId = req.body.data.id;

    //logtail.info('--INKSOFT-- New Customer: ', customerId);

    const config = {
        headers: {
          "X-Auth-Client": process.env.BG_AUTH_CLIENT,
          "X-Auth-Token": process.env.BG_AUTH_TOKEN,
        }
      };
  
    let customer = await axios
    .get(
      `https://api.bigcommerce.com/stores/${storeHash}/v2/customers/${customerId}`,
      config
    )
  
    customer = customer.data;

    //logtail.info('Customer Info: ', customer);
       
    const inksoftPassword = "t@91bW7He2!0Lo21";
    let email = customer.email;
    let first_name = customer.first_name;
    let last_name = customer.last_name;
    const apiKey = process.env.INKSOFT_API_KEY;
    let inksoftSess = '';
    
    try {
    logtail.info('--INKSOFT-- Registering User..');
  
    const inksoftData = `ApiKey=${apiKey}&Email=${email}&CreateNewCart=false&FirstName=${first_name}&LastName=${last_name}&Password=${inksoftPassword}&Format=JSON`;
    
    const newInksoftData = inksoftData.replace(/"/g, "");

    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/x-www-form-urlencoded"
      },
    };

    inksoftSess = await axios
      .post(
        `https://stores.inksoft.com/DS350156262/Api2/GetOrCreateSessionWithApiKey`,
        newInksoftData,
        config
      )

    inksoftSess = inksoftSess.data.Data.Token;
    
    } catch (err) {
      if (err.response.data.Messages) {
        logtail.info('--INKSOFT-- Error on Get/Create Session: ', err.response.data.Messages);
      } else {
        logtail.info('--INKSOFT-- Error on Get/Create Session: ', err);
      }
    }

    logtail.info('--INKSOFT-- Session: ', inksoftSess);
  
});



module.exports = router;
