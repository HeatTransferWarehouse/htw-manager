const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const axios = require("axios");


//Waiter Function
function timeoutPromise(interval) {
      return new Promise((resolve, reject) => {
        setTimeout(function () {
          resolve("done");
        }, interval);
      });
};


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

router.post("/items", (req, res) => {
  console.log("We are about to add to the item list");

  let name = req.body.name;
  let business = req.body.business;
  let phone = req.body.phone;
  let email = req.body.email;
  let customerid = req.body.customerid;
  let location = req.body.location;

  const queryText = `insert into "item" (name, business, phone, email, location, customerid) VALUES ($1, $2, $3, $4, $5, $6);`;
  pool
    .query(queryText, [name, business, phone, email, location, customerid])
    .then((selectResult) => {
      res.send(selectResult.rows);
    })
    .catch((error) => {
      console.log(`Error on item query ${error}`);
      res.sendStatus(500);
    });
});

router.delete("/items:id", async function (req, res) {
  console.log("We are deleting items with id:", req.params.id);
  const id = req.params.id[1];
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