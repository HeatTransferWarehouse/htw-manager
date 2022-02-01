const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const axios = require("axios");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


//Waiter Function
function timeoutPromise(interval) {
      return new Promise((resolve, reject) => {
        setTimeout(function () {
          resolve("done");
        }, interval);
      });
};


async function updatePrices(bc, sanmar) {
  try {
      if (bc[0]) {
        for (const item of bc) {
          console.log(`Updating Product with SKU: ${item.sku}`);
          await eachPrice(item.sku, sanmar);
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
      for (const item of sanmar) {

        console.log(`${item.sku} at $${item.price}`);

      let data = JSON.stringify({
        "price": item.price
      });

      let xhr = new XMLHttpRequest();
      xhr.withCredentials = true;

      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
          console.log(this.responseText);
        }
      });

      xhr.open("PUT", `https://api.bigcommerce.com/stores/et4qthkygq/v3/catalog/products/${product}/variants/${item.sku}`);
      xhr.setRequestHeader("accept", "application/json");
      xhr.setRequestHeader("content-type", "application/json");
      xhr.setRequestHeader("x-auth-token", "13n6uxj2je2wbnc0vggmz8sqjl93d1d");

      xhr.send(data);

      }
    }


router.put("/updatePrices", async function (req, res) {
  console.log("We are updating sanmar prices..");
  const bc = req.body.bcItems;
  const sanmar = req.body.sanmar;


  try {
    await updatePrices(bc, sanmar);
    res.sendStatus(200).send();
  } catch (err) {
    console.log('Error on update Prices: ', err);
    return res.status(500).send();
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