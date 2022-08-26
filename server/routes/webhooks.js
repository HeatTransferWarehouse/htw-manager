const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();
const app = express();
const cors = require('cors');

app.use(cors({
  origin: ['https://www.heattransferwarehouse.com']
}));

const {
  updateNote,
  getSO,
} = require('./Capture/api');

let storeHash = process.env.STORE_HASH
let config = {
    headers: {
      "X-Auth-Client": process.env.BG_AUTH_CLIENT,
      "X-Auth-Token": process.env.BG_AUTH_TOKEN,
    }
  };

const createNote = async (e, n) => {
  console.log('--INKSOFT-- Updating Note on BP...');
  await updateNote(e, n);
  console.log('--INKSOFT-- Note Updated..');
};

const inksoftSender = async (orderId, inksoft) => {

  console.log('--INKSOFT-- Fetching order for inksoft: ', orderId);

  let newOrder = await axios
    .get(
      `https://api.bigcommerce.com/stores/${storeHash}/v2/orders/${orderId}`,
      config
    )

  newOrder = newOrder.data;

  //console.log('--INKSOFT-- New Order Data: ', inksoft);

  const email = newOrder.billing_address.email;

    let designsToSend = [];
    let inksoftCart = [];
    let mainToken = inksoft[0].product_options[1].value;
    let currentCart = [];

    for (const i of inksoft) {

      let sku = i.sku;
      const skuSlice = sku.slice(0, 7);

      if (skuSlice === 'INKSOFT') {

        mainToken = i.product_options[1].value;
        let inksoftName = i.product_options[2].value;
        let quantity = i.quantity;

        console.log('--INKSOFT-- Token and Name: ', mainToken, inksoftName);

            inksoftCart = await axios
            .get(
              `https://stores.inksoft.com/DS350156262/Api2/GetCartPackage?SessionToken=${mainToken}&Format=JSON`,
              config
            )

        currentCart = inksoftCart.data.Data;
        //console.log('--INKSOFT-- Get Cart: ', currentCart);

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

        //console.log('--INKSOFT-- New Designs: ', designsToSend);

        currentCart.Cart.Items = designsToSend;

        let shippingMethods = [];


        try {

            shippingMethods = await axios
            .get(
              `https://stores.inksoft.com/DS350156262/Api2/GetShippingMethods?SessionToken=${mainToken}&Format=JSON&StoreId=296924`,
              config
            )

            shippingMethods = shippingMethods.data.Data[0];
            //console.log('--INKSOFT-- Get Ship Methods', shippingMethods);

        } catch (err) {
            console.log('--INKSOFT-- Error on Get Shipping: ', err);
            if (err.response.data.Messages) {
                console.log('--INKSOFT-- Get Shipping Error Messgae: ', err.response.data.Messages);
            }
            if (err.responseText) {
            console.log('--INKSOFT-- Get Shipping Error Messgae: ', err.responseText);
            }
        }


        currentCart.Cart.ShippingMethod = shippingMethods;
        currentCart.Cart.GuestEmail = '';

        let newCart = JSON.stringify(currentCart.Cart);
        let newNewCart = newCart.replace(/"/g, "'");

        //console.log('--INKSOFT-- New Cart Before Send: ', newNewCart);


        try {

          const data = `Cart=${newNewCart}&Format=JSON&SessionToken=${mainToken}&StoreId=296924`;

          config = {
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
              data,
              config
            )

            console.log('--INKSOFT-- Cart Modified..');

        } catch (err) {
            console.log('--INKSOFT-- Error on Set Cart: ', err);
            if (err.response.data.Messages) {
                console.log('--INKSOFT-- Set Cart Error Messgae: ', err.response.data.Messages);
            }
            if (err.responseText) {
            console.log('--INKSOFT-- Set Cart Error Messgae: ', err.responseText);
            }
        }

        let newOrder = [];

        try {

          const fileData = 'file';

          const data = `ExternalOrderId=${orderId}&PurchaseOrderNumber=${orderId}&SessionToken=${mainToken}&Email=${email}&StoreId=296924&FileData=${fileData}&IgnoreTotalDueCheck=true`;

          config = {
            headers: {
              "X-Auth-Client": process.env.BG_AUTH_CLIENT,
              "X-Auth-Token": process.env.BG_AUTH_TOKEN,
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/x-www-form-urlencoded"
            },
          };

          newOrder = await axios
            .post(
              `https://stores.inksoft.com/DS350156262/Api2/SaveCartOrder`,
              data,
              config
            )

            console.log('--INKSOFT-- Order Sent!');

        } catch (err) {
            console.log('--INKSOFT-- Error on Post Cart: ', err);
            if (err.responseText) {
            console.log('--INKSOFT-- Post Cart Error Messgae: ', err.responseText);
            }
        }

        const newOrderId = newOrder.data.Data;

        console.log('--INKSOFT-- New Order: ', newOrderId);

        try {
          const so = await getSO(orderId);
          console.log('--INKSOFT-- ', so.response.results[0][0]);
          const note = `Inksoft Order Number: ${newOrderId} --- Note made via Admin app. https://admin.heattransferwarehouse.com`;
          await createNote(so.response.results[0][0], note);
        } catch (err) {
          console.log('--INKSOFT-- Error on add note: ', err);
        }
    }
}


router.post("/orders", cors(), async function (req, res) {

  res.sendStatus(200);

  const orderId = req.body.data.id;

  //console.log('New Order: ', orderId);

  let inksoft = await axios
  .get(
    `https://api.bigcommerce.com/stores/${storeHash}/v2/orders/${orderId}/products`,
    config
  )

  inksoft = inksoft.data;

  //console.log('--INKSOFT-- Get Products: ', inksoft);

  let isInksoft = false;

  for (const i of inksoft) {

    let sku = i.sku;
    const skuSlice = sku.slice(0, 7);

    if (skuSlice === 'INKSOFT') {
      isInksoft = true;
    }

  }

if (isInksoft) {
    inksoftSender(orderId, inksoft);
}

});

router.post("/register", cors(), async function (req, res) {

    res.sendStatus(200);
  
    const customerId = req.body.data.id;

    console.log('New Customer: ', customerId);
  
    let customer = await axios
    .get(
      `https://api.bigcommerce.com/stores/${storeHash}/v2/customers/${customerId}`,
      config
    )
  
    customer = customer.data;

    //console.log('Customer Info: ', customer);
       
    const inksoftPassword = "t@91bW7He2!0Lo21";
    let email = customer.email;
    let first_name = customer.first_name;
    let last_name = customer.last_name;
    const apiKey = process.env.INKSOFT_API_KEY;
    
    let inksoftSess = '';
    let inksoftRegister = '';
    
    
    try {
    console.log('Creating Session..');
  
    const inksoftData = `ApiKey=${apiKey}&Email=${email}&CreateNewCart=false&FirstName=${first_name}&LastName=${last_name}&Password=${inksoftPassword}&Format=JSON`;
    
    const newInksoftData = inksoftData.replace(/"/g, "");

    config = {
      headers: {
        "X-Auth-Client": process.env.BG_AUTH_CLIENT,
        "X-Auth-Token": process.env.BG_AUTH_TOKEN,
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

    inksoftSess = resultData.data.Data.Token;
    
    } catch (err) {
      if (err.response) {
        console.log('Error on Get/Create Session: ', err.response);
      } else {
        console.log('Error on Get/Create Session: ', err);
      }
    }

    console.log('Token: ', inksoftSess);
  
    try {
    console.log('Registering user..');
        
    const inksoftData = `ApiKey=${ApiKey}&Password=${inksoftPassword}&ConfirmPassword=${inksoftPassword}&Email=${email}&FirstName=${first_name}&LastName=${last_name}&SessionToken=${inksoftSess}&Format=JSON&RememberMe=true&SubscribeToNewsletter=false`;
        
    const newInksoftData = inksoftData.replace(/"/g, "");

    config = {
        headers: {
          "X-Auth-Client": process.env.BG_AUTH_CLIENT,
          "X-Auth-Token": process.env.BG_AUTH_TOKEN,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/x-www-form-urlencoded"
        },
      };

    inksoftRegister = await axios
    .post(
      `https://stores.inksoft.com/DS350156262/Api2/Register`,
      newInksoftData,
      config
    )

    inksoftRegister = resultData.data.Data.Token;
  
    } catch (err) {
      if (err.response) {
        console.log('Error on Register User: ', err.response);
      } else {
        console.log('Error on Register User: ', err);
      }
    }
    
    console.log('Register: ', inksoftRegister);

  
  });



module.exports = router;
