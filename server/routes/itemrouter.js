const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const axios = require("axios");
const Client = require('ftp');
const moment = require('moment');
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const {
  updateNote,
  getSO,
} = require('./Capture/api');

const createNote = async (e) => {
  console.log('Updating Note on BP...');
  await updateNote(e);
  console.log('Note Updated..');
};

let config = {
  headers: {
    "X-Auth-Client": process.env.BG_AUTH_CLIENT,
    "X-Auth-Token": process.env.BG_AUTH_TOKEN,
  },
};


async function updatePrices(bc, sanmar) {
  try {
      if (bc[0]) {
        for (const item of bc) {
          if (item.sku > 5960) {
          console.log(`Updating Product with ID: ${item.sku}`);
          await eachPrice(item, sanmar);
          }
        }
        console.log('DONE');
        return;
      } else {
        console.log('No items in BC Items! Canceling!');
        return;
      }
    } catch (err) {
      console.log('Error on Update Product: ', err);
    }
}

async function eachPrice(product, sanmar) {

      const variants = await getSanmarId(product);

      for (const item of sanmar) {

        await eachSanmarItem(product, item, variants);

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
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products/${product.sku}/variants?limit=100?page=1`,
        config
      )
  } catch (err) {
    console.log('Error on Get Items1: ', err);
  }

  try {
    items2 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products/${product.sku}/variants?limit=100?page=2`,
        config
      )
  } catch (err) {
    console.log('Error on Get Items2: ', err);
  }

  try {
    items3 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products/${product.sku}/variants?limit=100?page=3`,
        config
      )
  } catch (err) {
    console.log('Error on Get Items3: ', err);
  }

  try {
    items4 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products/${product.sku}/variants?limit=100?page=4`,
        config
      )
  } catch (err) {
    console.log('Error on Get Items4: ', err);
  }

  try {
    items5 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products/${product.sku}/variants?limit=100?page=5`,
        config
      )
  } catch (err) {
    console.log('Error on Get Items5: ', err);
  }

  try {
    items6 = await axios
      .get(
        `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products/${product.sku}/variants?limit=100?page=6`,
        config
      )
  } catch (err) {
    console.log('Error on Get Items6: ', err);
  }

  if (items1.data.data) {
  for (const item of items1.data.data) {
    items.push(item);
  }
  }

  if (items2.data.data) {
  for (const item of items2.data.data) {
    items.push(item);
  }
  }

  if (items3.data.data) {
  for (const item of items3.data.data) {
    items.push(item);
  }
  }

  if (items4.data.data) {
  for (const item of items4.data.data) {
    items.push(item);
  }
  }

  if (items5.data.data) {
  for (const item of items5.data.data) {
    items.push(item);
  }
  }

  if (items6.data.data) {
  for (const item of items6.data.data) {
    items.push(item);
  }
  }

  return items;
}

async function eachSanmarItem(product, item, vars) {
  let searchedName = item.name.search(`${product.name}`);
  let preNewPrice = item.price * 1.4;
  let newPrice = Math.round(preNewPrice * 100) / 100
  let putId = 0;

    for (const variant of vars) {
        if (variant.sku === item.sku) {
          putId = variant.id;
      }
    }

    if (putId !== 0) {
    
    console.log(`${product.sku} at ${putId} and $${newPrice}`);

    const http = require("https");

    const options = {
      "method": "PUT",
      "hostname": "api.bigcommerce.com",
      "port": null,
      "path": `/stores/et4qthkygq/v3/catalog/products/${product.sku}/variants/${putId}`,
      "headers": {
        "accept": "application/json",
        "content-type": "application/json",
        "x-auth-token": "13n6uxj2je2wbnc0vggmz8sqjl93d1d"
      }
    };

    const req = http.request(options, function (res) {
      const chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        const body = Buffer.concat(chunks);
        console.log(body.toString());
      });
    });

    req.write(JSON.stringify({
      price: newPrice
    }));
    req.end();

    } else {
      //console.log('No Variant Found to sync ID!');
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
    console.log(file);
    return file;
}


router.put("/updatePrices", async function (req, res) {
  console.log("We are updating sanmar prices..");
  const bc = req.body.bcItems;
  const sanmar = req.body.sanmar;

  res.sendStatus(200).send();

  try {
    await updatePrices(bc, sanmar);
  } catch (err) {
    console.log('Error on update Prices: ', err);
  }

});

router.put("/ftp", async function (req, res) {
  console.log("We are connecting to the ftp client..");
  const host = req.body.host;
  const password = req.body.password;
  const user = req.body.user;
  const date = req.body.date;
  const c = new Client();

  try {
    console.log('Logging into FTP Client..');

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
        if (err) throw err;
        stream.once('close', function () {
          c.end();
        });
        stream.pipe(res);

        stream.on('end', function(){ res.end() });
      });
    });
    //res.send('YES').status(201);
  } catch (err) {
    console.log('Error on connect ftp: ', err);
    res.send('NO').status(500);
  }

});

router.put("/email", async function (req, res) {
  console.log("We are sending an email..");
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
    console.log('Error on get order: ', err);
    res.sendStatus(500);
  }

  try {
            const email = response.data.billing_address.email;
            //const email = 'tre@heattransferwarehouse.com';
            let first_name = response.data.billing_address.first_name;
            console.log(email, first_name);
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
                console.log('Email sent')
              })
              .catch((error) => {
                console.error(error)
              })
  
          } catch (err) {
            console.log('Error on send email: ', err);
            res.sendStatus(500);
          }
        
  try {
    const so = await getSO(order);
    console.log(so.response.results[0][0]);
    await createNote(so.response.results[0][0]);
  } catch (err) {
    console.log('Error on add note: ', err);
    res.sendStatus(500);
  }
});

router.get("/getitems", (req, res) => {
  console.log("We are about to get the item list");

  const queryText = `select * from "item" ORDER BY id DESC`;
  pool
    .query(queryText)
    .then((selectResult) => {
      res.send(selectResult.rows);
    })
    .catch((error) => {
      console.log(`Error on item query ${error}`);
      res.sendStatus(500);
    });
});

router.get("/getsanmar", (req, res) => {
  console.log("We are about to get the sanmar list");

  const queryText = `select * from "sanmar" ORDER BY id DESC`;
  pool
    .query(queryText)
    .then((selectResult) => {
      res.send(selectResult.rows);
    })
    .catch((error) => {
      console.log(`Error on item query ${error}`);
      res.sendStatus(500);
    });
});

router.post("/addOrder", async function (req, res) {
  console.log("We are about to add an order to sanmar db");
  const o = req.body.order;
  const tracking = req.body.tracking;
  console.log(o, tracking);

try {
  const queryText = `INSERT INTO "sanmar" (ref, tracking) VALUES ($1, $2);`;
  await pool
    .query(queryText, [o, tracking])
} catch (err) {
  console.log('Error on add order: ', err);
  return res.status(500);
}

  console.log("We are about to get the sanmar list");

  const queryText = `select * from "sanmar" ORDER BY id DESC`;
  pool
    .query(queryText)
    .then((selectResult) => {
      res.send(selectResult.rows);
    })
    .catch((error) => {
      console.log(`Error on item query ${error}`);
      res.sendStatus(500);
    });

});

router.post("/items", async function (req, res) {
  console.log("We are about to add to the item list");

try {
  await addItems();
} catch (err) {
  console.log('Error on add items: ', err);
  return res.status(500);
}

try {
  res.sendStatus(200);
} catch (err) {
  console.log('Error on send 200: ', err);
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
          console.log('Error on get single item: ', err);
          return res.status(500);
        }
  }
 }
});

router.delete("/all", async function (req, res) {
  console.log("We are about to delete the item list");

  try {
    console.log('deleting items');
    const queryText = `DELETE from "item";`;
    await pool
      .query(queryText)
  } catch (err) {
    console.log('Error on delete items: ', err);
    return res.status(500);
  }

  try {
    res.sendStatus(200);
  } catch (err) {
    console.log('Error on send 200: ', err);
    return res.status(500);
  }
});

router.delete("/items:id", async function (req, res) {
  console.log("We are deleting items with id:", req.params.id);
  const id = req.params.id;
  console.log(id);
  
  try {
      const queryText = 'delete from "item" WHERE id = $1';
      await pool
        .query(queryText, [id])
      return res.status(200).send();
  } catch (err) {
    console.log('Error on delete: ', err);
    return res.status(500).send();
  }
    
});

router.put("/items/:id", async function (req, res) {
  console.log("We are updating items as dead with id:", req.params.id);
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
      console.log(item);
    const queryText = `UPDATE "item" SET dead = true WHERE id = ${item}`;
    await pool
      .query(queryText)
    }
  } catch (err) {
    console.log('Error on update: ', err);
    return res.status(500).send();
  }
  
  try {
    console.log("We are about to get the item list");

    const queryText = `select * from "item" ORDER BY id DESC`;
    await pool
      .query(queryText)
      .then((selectResult) => {
        res.send(selectResult.rows);
      })
      .catch((error) => {
        console.log(`Error on item query ${error}`);
        res.sendStatus(500);
      });
  } catch (err) {
    console.log('Error on Get: ', err);
    return res.status(500).send();
  }
    
});


module.exports = router;