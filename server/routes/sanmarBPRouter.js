const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const axios = require("axios");
const Client = require('ftp');
const moment = require('moment');
const sgMail = require("@sendgrid/mail");
const fs = require("fs");
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { Logtail } = require("@logtail/node");

const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

app.use(cors({
  origin: ['https://www.heattransferwarehouse.com']
}));

const {
  updateNote,
  getSO,
} = require('./Capture/api');

// const now = new Date();
// let millisTill8 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0) - now;
// if (millisTill8 < 0) {
//      millisTill8 += 86400000; // it's after 8am, try 8am tomorrow.
// }

// setTimeout(function () {
//   const today = new Date();
//   const yesterday = new Date(today);

//   yesterday.setDate(yesterday.getDate() - 1);

  // const host = 'ftp.sanmar.com';
  // const user = '175733';
  // const password = 'Sanmar33';
  // const c = new Client();

  // try {
  //   logtail.info('--SANMAR-- Logging into FTP Client..');

  //   const ftpConfig = {
  //     host: `${host}`,
  //     port: 21,
  //     user: `${user}`,
  //     password: `${password}`,
  //   }
    
  //   const file = await getFile(yesterday);

  //   c.connect(ftpConfig);

  //   c.on('ready', function () {
  //     c.get(`/000175733Status/${file}`, function (err, stream) {
  //       if (err) {
  //         logtail.info('--SANMAR-- Error on SanMar FTP Download: ', err);
  //         c.end();
  //       }

  //       stream.once('close', function () {
  //         c.end();
  //       });
        
  //       stream.pipe(res);

  //       stream.on('end', function(){
  //         if (err) {
  //           res.status(500).end();
  //         } else {
  //           res.end();
  //         }
  //       });
  //     });
  //   });
  // } catch (err) {
  //   logtail.info('--SANMAR-- Error on connect ftp: ', err);
  //   res.status(500).end();
  // }

  // }, millisTill8);

const createNote = async (e) => {
  logtail.info('--SANMAR-- Updating Note on BP...');
  const note = "Email Sent via Admin app. https://admin.heattransferwarehouse.com";
  await updateNote(e, note);
  logtail.info('--SANMAR-- Note Updated..');
};

let config = {
  headers: {
    "X-Auth-Client": process.env.BG_AUTH_CLIENT,
    "X-Auth-Token": process.env.BG_AUTH_TOKEN,
  },
};

//Waiter Function
function timeoutPromise(interval) {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve("done");
    }, interval);
  });
};

async function updatePrices(bc, sanmar, start) {
  try {
      if (bc[0]) {
        const number = Number(start);
        for (const item of bc) {
          if (item.sku > number) {
          logtail.info(`--SANMAR-- Updating Product with ID: ${item.sku}`);
          await eachPrice(item, sanmar);
          await timeoutPromise(1000);
          }
        }
        logtail.info('--SANMAR-- DONE');
        return;
      } else {
        logtail.info('--SANMAR-- No items in BC Items! Canceling!');
        return;
      }
    } catch (err) {
      logtail.info('--SANMAR-- Error on Update Product: ', err);
    }
}

async function eachPrice(product, sanmar) {

      const variants = await getSanmarId(product);

      for (const item of sanmar) {
        if (variants[0]) {
          await eachSanmarItem(product, item, variants);
        }
      }
}

async function getSanmarId(product) {

  let config = {
    headers: {
      "X-Auth-Client": process.env.BG_AUTH_CLIENT,
      "X-Auth-Token": process.env.BG_AUTH_TOKEN,
    }
  };

  let items = [];
  let items1;
  let items2;
  let items3;
  let items4;
  let items5;
  let items6;

  try {
    items1 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products/${product.sku}/variants?page=1&limit=100`,
        config
      )
  } catch (err) {
    logtail.info('--SANMAR-- Error on Get Items1: ', err);
  }

  try {
    items2 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products/${product.sku}/variants?page=2&limit=100`,
        config
      )
  } catch (err) {
    logtail.info('--SANMAR-- Error on Get Items2: ', err);
  }

  try {
    items3 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products/${product.sku}/variants?page=3&limit=100`,
        config
      )
  } catch (err) {
    logtail.info('--SANMAR-- Error on Get Items3: ', err);
  }

  try {
    items4 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products/${product.sku}/variants?page=4&limit=100`,
        config
      )
  } catch (err) {
    logtail.info('--SANMAR-- Error on Get Items4: ', err);
  }

  try {
    items5 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products/${product.sku}/variants?page=5&limit=100`,
        config
      )
  } catch (err) {
    logtail.info('--SANMAR-- Error on Get Items5: ', err);
  }

  try {
    items6 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products/${product.sku}/variants?page=6&limit=100`,
        config
      )
  } catch (err) {
    logtail.info('--SANMAR-- Error on Get Items6: ', err);
  }

  if (items1.data.data[0]) {
      //logtail.info('Page 1');
  for (const item of items1.data.data) {
    items.push(item);
   }
  }

  if (items2.data.data[0]) {
      //logtail.info('Page 2');
  for (const item of items2.data.data) {
    items.push(item);
   }
  }

  if (items3.data.data[0]) {
      //logtail.info('Page 3');
  for (const item of items3.data.data) {
    items.push(item);
   }
  }

  if (items4.data.data[0]) {
      //logtail.info('Page 4');
  for (const item of items4.data.data) {
    items.push(item);
   }
  }

  if (items5.data.data[0]) {
    //logtail.info('Page 5');
  for (const item of items5.data.data) {
    items.push(item);
   }
  }

  if (items6.data.data[0]) {
    //logtail.info('Page 6');
  for (const item of items6.data.data) {
    items.push(item);
   }
  }

  return items;
}

async function eachSanmarItem(product, item, vars) {
  let preNewPrice = item.price * 1.4;
  let newPrice = Math.round(preNewPrice * 100) / 100
  let putId = 0;
  let putVar = 0;

    for (const variant of vars) {
        if (variant.sku === item.sku) {
          putId = variant.id;
          putVar = variant.sku;
      }
    }

    if (putId !== 0) {
    
    //logtail.info(`${product.sku} at ${putVar} and $${newPrice}`);

    const http = require("https");

    const options = {
      "method": "PUT",
      "hostname": "api.bigcommerce.com",
      "port": null,
      "path": `/stores/${process.env.STORE_HASH}/v3/catalog/products/${product.sku}/variants/${putId}`,
      "headers": {
        "accept": "application/json",
        "content-type": "application/json",
        "x-auth-token": process.env.BG_AUTH_TOKEN
      }
    };

    const req = http.request(options, function (res) {
      const chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        // const body = Buffer.concat(chunks);
        // logtail.info(body.toString());
      });
    });

    req.write(JSON.stringify({
      price: newPrice
    }));
    req.end();

    await timeoutPromise(100);

    } else {
      //logtail.info('No Variant Found to sync ID!');
    }
}

async function getFile(date) {

    const newDate = moment(date).toObject();
    let d = newDate.date
    let m = newDate.months
    m++
    let y = `${newDate.years}`;
    y = y.slice(2);
    let file = ''
    if (m < 10 && d < 10) {
      file = `0${m}-0${d}-${y}status.txt`;
    } else if (m < 10) {
      file = `0${m}-${d}-${y}status.txt`;
    } else if (d < 10) {
      file = `${m}-0${d}-${y}status.txt`;
    } else {
      file = `${m}-${d}-${y}status.txt`;
    }
    logtail.info(file);
    return file;
}

//Get All BC Items Function
async function getBCItems() {

  logtail.info('--SANMAR-- Getting Products..');

  let bcResponse1;
  let bcResponse2;
  let bcResponse3;
  let bcResponse4;
  let bcResponse5;
  let bcResponse6;
  let bcResponse7;
  let bcResponse8;
  let bcResponse9;
  let bcResponse10;
  let bcResponse11;
  let bcResponse12;
  let bcResponse13;
  let bcResponse14;
  let bcResponse15;
  let bcResponse16;
  let bcResponse17;
  let bcResponse18;
  let bcResponse19;
  let bcResponse20;
  let bcResponse21;
  let bcResponse22;
  let bcResponse23;
  let bcResponse24;
  let bcResponse25;
  let bcResponse26;
  let bcResponse27;
  let bcResponse28;
  let bcResponse = [];


  try {
    bcResponse1 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=1`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get1: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse2 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=2`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get2: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse3 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=3`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get3: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse4 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=4`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get4: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse5 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=5`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get5: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse6 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=6`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get6: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse7 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=7`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get7: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse8 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=8`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get8: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse9 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=9`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get9: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse10 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=10`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get10: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse11 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=11`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get11: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse12 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=12`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get12: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse13 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=13`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get13: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse14 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=14`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get14: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse15 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=15`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get15: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse16 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=16`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get16: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse17 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=17`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get17: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse18 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=18`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get18: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse19 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=19`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get19: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse20 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=20`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get20: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse21 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=21`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get21: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse22 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=22`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get22: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse23 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=23`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get23: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse24 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=24`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get24: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse25 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=25`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get25: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse26 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=26`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get26: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse27 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=27`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get27: ', err);
  }

  await timeoutPromise(500);

  try {
    bcResponse28 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products?limit=250&page=28`,
        config
      )
  } catch (err) {
    logtail.info('Error on Get28: ', err);
  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse1.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse2.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse3.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse4.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse5.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse6.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse7.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse8.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse9.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse10.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse11.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse12.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse13.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse14.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse15.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse16.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse17.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse18.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse19.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse20.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse21.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse22.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse23.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse24.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse25.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse26.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse27.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);

  }

  await timeoutPromise(500);

  try {
    for (item of bcResponse28.data.data) {
      bcResponse.push(item);
    }
  } catch (err) {
    logtail.info('Error on bcCreate: ', err);
  }

  await timeoutPromise(200);

  return bcResponse;
}

async function calculateSales(products) {
  let newProducts = [];

  for (const prod of products) {
    let preNewName = prod.name.replace(/™/g, "");
    let extraNewName = preNewName.replace(/Æ/g, "");
    let extraNewName2 = extraNewName.replace(/¬/g, "");
    let newNewName2 = extraNewName2.replace(/Ñ/g, "");
    let newNewName = newNewName2.replace(/¢/g, "");
    let newName = newNewName.replace(/®/g, "");
    if (prod.brand_id === 87 || prod.brand_id === 83 || prod.brand_id === 79 || prod.brand_id === 77 || prod.brand_id === 75 || prod.brand_id === 84 || prod.brand_id === 80 || prod.brand_id === 81 || prod.brand_id === 92 || prod.brand_id === 91 || prod.brand_id === 96 || prod.brand_id === 90 || prod.brand_id === 89 || prod.brand_id === 88 || prod.brand_id === 86 || prod.brand_id === 97 || prod.brand_id === 82 || prod.brand_id === 85 || prod.brand_id === 78 || prod.brand_id === 76 || prod.brand_id === 73 || prod.brand_id === 74) {
      newProducts.push({
        id: prod.id,
        name: newName
      });
    }
  }

  return newProducts;
}

router.put("/updatePrices", async function (req, res) {
  logtail.info("--SANMAR-- We are updating sanmar prices..");
  const bc = req.body.bcItems;
  const sanmar = req.body.sanmar;
  const start = req.body.start;

  res.status(200).send();

  try {
    await updatePrices(bc, sanmar, start);
  } catch (err) {
    logtail.info('Error on update Prices: ', err);
  }

});

router.put("/ftp", async function (req, res) {
  logtail.info("--SANMAR-- We are connecting to the ftp client..");
  const host = req.body.host;
  const password = req.body.password;
  const user = req.body.user;
  const date = req.body.date;
  const c = new Client();

  try {
    logtail.info('--SANMAR-- Logging into FTP Client..');

    const ftpConfig = {
      host: `${host}`,
      port: 21,
      user: `${user}`,
      password: `${password}`,
    }
    const file = await getFile(date);

    c.connect(ftpConfig);

    c.on('ready', function () {
      c.get(`/000175733Status/${file}`, function (err, stream) {
        if (err) {
          logtail.info('--SANMAR-- Error on SanMar FTP Download: ', err);
          c.end();
        }

        stream.once('close', function () {
          c.end();
        });
        
        stream.pipe(res);

        stream.on('end', function(){
          if (err) {
            res.status(500).end();
          } else {
            res.end();
          }
        });
      });
    });
  } catch (err) {
    logtail.info('--SANMAR-- Error on connect ftp: ', err);
    res.status(500).end();
  }

});

router.put("/ftpPrices", async function (req, res) {
  logtail.info("--SANMAR-- We are connecting to the ftp client..");
  const host = req.body.host;
  const password = req.body.password;
  const user = req.body.user;
  const c = new Client();


  try {
    logtail.info('--SANMAR-- Logging into FTP Client..');

    const ftpConfig = {
      host: `${host}`,
      port: 21,
      user: `${user}`,
      password: `${password}`,
    }

    c.connect(ftpConfig);

    c.on('ready', function () {
      logtail.info('--SANMAR-- Downloading Sanmar Prices..');
      c.get(`/SanMarPDD/SanMar_SDL_DI.zip`, function (err, stream) {
        if (err) throw err;
        stream.once('close', function () {
          c.end();
        });
        stream.pipe(fs.createWriteStream('download.zip'));

        stream.on('end', function () {
          res.sendStatus(201);
        });
      });
    });
    //res.send('YES').status(201);
  } catch (err) {
    logtail.info('--SANMAR-- Error on connect ftp: ', err);
    res.status(500).send('NO');
  }

});

router.post("/sanmarDB", async function (req, res) {
  logtail.info("--SANMAR-- We are about to update the sanmar list");

  let response = req.body.products;

  try {

    const queryText = `DELETE from "sanmar-prices"`;
    await pool
      .query(queryText)
  } catch (err) {
    logtail.info('--SANMAR-- Error on delete sanmar prices: ', err);
    return res.status(500);
  }

  for (const product of response) {
    try {
      let name = product.name;
      let sku = product.sku;
      let color = product.color;
      let size = product.size;
      let price = product.price;

      const queryText2 = `insert into "sanmar-prices" (name, sku, color, size, price) VALUES ($1, $2, $3, $4, $5);`;
      await pool
        .query(queryText2, [name, sku, color, size, price])
    } catch (err) {
      logtail.info('--SANMAR-- Error on post single item: ', err);
      res.sendStatus(500);
    }
  }

  res.sendStatus(201);
});

router.get("/getSanmarPrices", async function (req, res) {
  logtail.info("--SANMAR-- We are about to get the sanmar price list");

  let response = [];

  try {
    const queryText = `select * from "sanmar-prices"`;
    response = await pool
      .query(queryText)
  } catch (err) {
    logtail.info('--SANMAR-- Error on delete sanmar prices: ', err);
    return res.status(500);
  }

  res.status(200).send(response.rows);
});

router.put("/email", async function (req, res) {
  logtail.info("--SANMAR-- We are sending an email..");
  const order = req.body.order;
  const tracking = req.body.tracking;
  let response = [];

  try {
    response = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v2/orders/${order}`,
        config
      )
  } catch (err) {
    logtail.info('--SANMAR-- Error on get order: ', err);
    res.sendStatus(500);
  }

  try {
            const email = response.data.billing_address.email;
            //const email = 'tre@heattransferwarehouse.com';
            let first_name = response.data.billing_address.first_name;
            logtail.info('--SANMAR-- ', email, first_name);
            let titleString = `
            <div>
              <img
                src="https://cdn11.bigcommerce.com/s-et4qthkygq/product_images/uploaded_images/clothing-order-2.png?t=1645461029"
                width="100%"
                alt=""
              />
            </div>
            <br>
            <br>
              <p><strong>Hi ${first_name}!</strong></p>
              <p>Thank you for your order from Heat Transfer Warehouse!</p>
            <br>
            <br>
            <table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;">
              <tr>
                <td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Order number:</td>
                <td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"> ${order} </td>
              </tr>
            </table>
            <br>
            <i>Here are your Tracking Numbers: </i>
            <br>
            <p><strong>NOTE: </strong>Tracking Numbers are from UPS!</p>
            <br>`;
            let infoArray = [];
            for (const item of tracking) {
            let info = `
            <div>
            <table style="border-collapse: collapse; font-family:Arial Narrow, sans-serif;">
              <tr>
                <td style="width: 20%; border: 1px solid white; padding: 5px; margin: 5px; background-color: #006bd6; color: white;">Tracking #:</td>
                <td style="width: 80%; border: 1px solid #909090; padding: 5px; margin: 5px;"><a href="https://www.ups.com/track?loc=null&tracknum=${item}&requester=WT/trackdetails"> ${item} </a></td>
              </tr>
            </table>
            </div>`

            infoArray.push(info);
            }
            let newArray = infoArray.join("");
            let locationInfo = 'Heat Transfer Warehouse Company. 1501 21st Avenue North Fargo, North Dakota 58102';
            let lastString = `<br><br><br><div style="color:#DCDCDC; background-color:#DCDCDC; font-family:Arial Narrow, sans-serif; opacity:0.5;">${locationInfo}</div>`;
            let final =
              `<html>` +
              `<div>` +
              titleString +
              newArray +
              lastString +
              `</div>` +
              `</html>`;
            const msg = {
              "personalizations": [
                {
                  "to": [
                    //send to the customers email address
                    {
                      "email": `${email}`,
                    },
                  ],
                },
              ],
              "from": "sales@heattransferwarehouse.com", 
              "subject": `Your clothing order from Heat Transfer Warehouse: ${order}`,
              "html": `${final}`,
            };
            await sgMail
              .send(msg)
              .then(() => {
                logtail.info('--SANMAR-- Email sent')
              })
              .catch((error) => {
                console.error(error)
              })
  
          } catch (err) {
            logtail.info('--SANMAR-- Error on send email: ', err);
            res.sendStatus(500);
          }
        
  try {
    const so = await getSO(order);
    logtail.info('--SANMAR-- ', so.response.results[0][0]);
    await createNote(so.response.results[0][0]);
  } catch (err) {
    logtail.info('--SANMAR-- Error on add note: ', err);
    res.sendStatus(500);
  }
});

router.get("/getitems", (req, res) => {
  logtail.info("--BRIGHTPEARL-- We are about to get the BP list");

  const queryText = `select * from "item" ORDER BY id DESC`;
  pool
    .query(queryText)
    .then((selectResult) => {
      res.status(201).send(selectResult.rows);
    })
    .catch((error) => {
      logtail.info(`--BRIGHTPEARL-- Error on item query ${error}`);
      res.sendStatus(500);
    });
});

router.get("/getsanmar", (req, res) => {
  logtail.info("--SANMAR-- We are about to get the sanmar list");

  const queryText = `select * from "sanmar" ORDER BY id DESC`;
  pool
    .query(queryText)
    .then((selectResult) => {
      res.status(201).send(selectResult.rows);
    })
    .catch((error) => {
      logtail.info(`--SANMAR-- Error on item query ${error}`);
      res.sendStatus(500);
    });
});

router.get("/refreshBC", async function (req, res) {
  logtail.info("--SANMAR-- We are about to update the bc list");

  let response = [];

  try {

    const queryText = `DELETE from "bc-prices"`;
    await pool
      .query(queryText)
  } catch (err) {
    logtail.info('--SANMAR-- Error on delete bc prices: ', err);
    return res.status(500);
  }

  try {
    response = await getBCItems();
  } catch (err) {
    res.sendStatus(500);
  }

  let newResponse = await calculateSales(response);

  for (const product of newResponse) {
    try {
      let name = product.name;
      let sku = product.id;

      const queryText2 = `insert into "bc-prices" (name, sku) VALUES ($1, $2);`;
      await pool
        .query(queryText2, [name, sku])
    } catch (err) {
      logtail.info('--SANMAR-- Error on post single bc price: ', err);
      res.sendStatus(500);
    }
  }

  res.sendStatus(201);
});

router.get("/getBC", async function (req, res) {
  logtail.info("--SANMAR-- We are about to get the bc price list");

  let response = [];

  try {
    const queryText = `select * from "bc-prices"`;
    response = await pool
      .query(queryText)
  } catch (err) {
    logtail.info('--SANMAR-- Error on delete bc prices: ', err);
    return res.status(500);
  }

  res.status(200).send(response.rows);
});

router.post("/addOrder", async function (req, res) {
  logtail.info("--SANMAR-- We are about to add an order to sanmar db");
  const o = req.body.order;
  const tracking = req.body.tracking;
  logtail.info(o, tracking);

  try {
  const queryText = `INSERT INTO "sanmar" (ref, tracking) VALUES ($1, $2);`;
  await pool
    .query(queryText, [o, tracking])
  } catch (err) {
  logtail.info('--SANMAR-- Error on add order: ', err);
  return res.status(500);
  }

  logtail.info("--SANMAR-- We are about to get the sanmar list");

  const queryText = `select * from "sanmar" ORDER BY id DESC`;
  pool
    .query(queryText)
    .then((selectResult) => {
      res.status(201).send(selectResult.rows);
    })
    .catch((error) => {
      logtail.info(`--SANMAR-- Error on item query ${error}`);
      res.sendStatus(500);
    });

});

router.post("/items", async function (req, res) {
  logtail.info("--BRIGHTPEARL-- We are about to add to the item list");

  try {
  await addItems();
  } catch (err) {
  logtail.info('--BRIGHTPEARL-- Error on add items: ', err);
  return res.status(500);
  }

  try {
  res.sendStatus(200);
  } catch (err) {
  logtail.info('--BRIGHTPEARL-- Error on send 200: ', err);
  return res.status(500);
  }

  async function addItems () {

  for (const product of req.body.products) {
        try {
          let name = product.name;
          let sku = product.sku;
          let bulk = parseInt(product.bulk);
          let width = product.width;
          let type = product.type;
          let color = product.color;
          let sales = product.sales;

          const queryText2 = `insert into "item" (name, sku, bulk, width, type, color, sales) VALUES ($1, $2, $3, $4, $5, $6, $7);`;
          await pool
            .query(queryText2, [name, sku, bulk, width, type, color, sales])
        } catch (err) {
          logtail.info('--BRIGHTPEARL-- Error on get single item: ', err);
          return res.status(500);
        }
  }
 }
});

router.delete("/all", async function (req, res) {
  logtail.info("--BRIGHTPEARL-- We are about to delete the item list");

  try {
    logtail.info('--BRIGHTPEARL-- deleting items');
    const queryText = `DELETE from "item";`;
    await pool
      .query(queryText)
  } catch (err) {
    logtail.info('--BRIGHTPEARL-- Error on delete items: ', err);
    return res.status(500);
  }

  try {
    res.sendStatus(200);
  } catch (err) {
    logtail.info('--BRIGHTPEARL-- Error on send 200: ', err);
    return res.status(500);
  }
});

router.delete("/items:id", async function (req, res) {
  logtail.info("--BRIGHTPEARL-- We are deleting items with id:", req.params.id);
  const id = req.params.id;
  logtail.info(id);
  
  try {
      const queryText = 'delete from "item" WHERE id = $1';
      await pool
        .query(queryText, [id])
      return res.status(200).send();
  } catch (err) {
    logtail.info('--BRIGHTPEARL-- Error on delete: ', err);
    return res.status(500).send();
  }
    
});

router.put("/items/:id", async function (req, res) {
  logtail.info("--BRIGHTPEARL-- We are updating items as dead with id:", req.params.id);
  const ids = req.params.id;

  let items = [];
  let itemToPush = '';
  for (let i = 0; i < ids.length; i++) {
    if (ids[i] !== ',') {
      itemToPush += (ids[i]);
    } if (ids[i] === ',') {
      items.push(itemToPush);
      itemToPush = '';
    }
  }
  items.push(itemToPush);
  itemToPush = '';

  try {
    for (item of items) {
      logtail.info(item);
    const queryText = `UPDATE "item" SET dead = true WHERE id = ${item}`;
    await pool
      .query(queryText)
    }
  } catch (err) {
    logtail.info('--BRIGHTPEARL-- Error on update: ', err);
    return res.status(500).send();
  }
  
  try {
    logtail.info("--BRIGHTPEARL-- We are about to get the item list");

    const queryText = `select * from "item" ORDER BY id DESC`;
    await pool
      .query(queryText)
      .then((selectResult) => {
        res.status(201).send(selectResult.rows);
      })
      .catch((error) => {
        logtail.info(`--BRIGHTPEARL-- Error on item query ${error}`);
        res.sendStatus(500);
      });
  } catch (err) {
    logtail.info('--BRIGHTPEARL-- Error on Get: ', err);
    return res.status(500).send();
  }
    
});

router.post("/updateCart", async function (req, res) {
  logtail.info("--INKSOFT-- We are about to update a cart on BC");

  const customer = req.body.customer;
  const id = req.body.id;
  const token = req.body.token;
  logtail.info(id, ' and ', token);
  let ir = [];

  logtail.info(cr);

  try {
    ir = await axios
      .get(
        `https://stores.inksoft.com/DS350156262/Api2/GetCartPackage?SessionToken=${token}&Format=JSON&SessionId=${id}`,
        config
      )
  } catch (err) {
    logtail.info('--INKSOFT-- Error on get inksoft: ', err);
    return res.status(500);
  }

  logtail.info(ir);

  try {
    await axios
      .post(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/carts/${customer}/items`,
        config
      )
  } catch (err) {
    logtail.info('--INKSOFT-- Error on update cart: ', err);
    return res.status(500);
  }

  res.sendStatus(200);
});

router.post("/register", cors(), async function (req, res) {
  logtail.info("--INKSOFT-- We are about to decode a JWT token");

  const token = req.body.token;
  //logtail.info('Token: ', token);
  let decoded = '0';

  try {
    decoded = jwt.verify(token, '9461605d7e247c64d913b6ec2ec75f9c72f873b6edc81b6e944a54d8daef984a');
  } catch (err) {
    logtail.info('Invalid: ', err);
  }

  //logtail.info(decoded);

  let customer = [];
  const customer_id = decoded.customer.id;

  try {
    customer = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v2/customers/${customer_id}`,
        config
      )
  } catch (err) {
    logtail.info('--INKSOFT-- Error on Get Customer: ', err);
  }

  //logtail.info('Response: ', customer);

  const cust = customer.data;

  const inksoftPassword = "t@91bW7He2!0Lo21";
  let email = JSON.stringify(cust.email);
  let first_name = JSON.stringify(cust.first_name);
  let last_name = JSON.stringify(cust.last_name);
  const apiKey = process.env.INKSOFT_API_KEY;

  const info = {
    password: inksoftPassword,
    email: email,
    first_name: first_name,
    last_name: last_name,
    apiKey: apiKey
  }

  logtail.info('--INKSOFT-- Sending Back: ', cust.email);

  res.status(200).send(info);
});

module.exports = router;