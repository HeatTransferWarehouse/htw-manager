require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();
const pool = require("../modules/pool");
const moment = require("moment");

async function getBCOrderDetails(orderId) {
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

  let normalHour = Number(hour);
  let AmPm = "am";
  if (normalHour > 12) {
    AmPm = "pm";
    normalHour = normalHour - 12;
  } else if (normalHour === 12) {
    AmPm = "pm";
  } else if (normalHour === 0o0) {
    AmPm = "am";
    normalHour = 12;
  }
  //defines a datestring used for the timestamp
  let dateString = `Date: ${nowMonth}/${nowDay}/${nowYear} Time: ${normalHour}:${min}:${sec}${AmPm}`;
  try {
    const headers = {
      "Content-Type": "application/json",
      "X-Auth-Token": process.env.BG_AUTH_TOKEN,
    };

    const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders/${orderId}`;

    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      createQueueInfo({ orderData: response.data, timeStamp: dateString });
    } else {
      // Handle the error if the status is not 200
      logtail.error(`Error fetching order ${orderId}: ${response.status}`);
      return null;
    }
  } catch (error) {
    // Log the error if the request fails
    logtail.error(`Failed to fetch order ${orderId}: ${error.message}`);
    return null;
  }
}

// getBCOrderDetails(3538208);

const createQueueInfo = async (data) => {
  const orderObj = {
    order_id: data.orderData.id,
    email: data.orderData.billing_address.email,
    first_name: data.orderData.billing_address.first_name,
    last_name: data.orderData.billing_address.last_name,
  };

  const products = await getBCOrderProducts(data.orderData.id);

  const filteredProducts = await filterBCProducts({
    products,
    orderObj,
    createdAt: data.timeStamp,
  });

  try {
    await axios.post(
      `https://admin.heattransferwarehouse.com/api/queue/item-queue/add`,
      {
        items: filteredProducts,
      }
    );
    // await axios.post(`http://localhost:3000/api/queue/item-queue/add`, {
    //   items: filteredProducts,
    // });
  } catch (error) {
    console.log("Error posting to add-queue-items:", error.message);
  }
};

const getBCOrderProducts = async (orderId) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      "X-Auth-Token": process.env.BG_AUTH_TOKEN,
    };

    const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders/${orderId}/products`;

    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      return response.data;
    } else {
      // Handle the error if the status is not 200
      logtail.error(
        `Error fetching order products for ${orderId}: ${response.status}`
      );
      return null;
    }
  } catch (error) {
    // Log the error if the request fails
    logtail.error(
      `Failed to fetch order products for ${orderId}: ${error.message}`
    );
    return null;
  }
};

const filterBCProducts = async (data) => {
  console.log(data.products);
  const matchedProducts = [];
  const skuPatterns = {
    decoSku3: ["CD", "CS", "SD", "SP-"],
    decoSku6: ["CUSTOM", "SUBKIT", "SUBPAT"],
    decoSku8: ["SETUPFEE", "PRIDE-", "SKULLS-R", "AUTISM-R", "SPIRITUA"],
    decoSku7: [
      "SISER-1",
      "SISER-2",
      "SISER-3",
      "SISER-4",
      "SISER-5",
      "SISER-6",
      "SISER-7",
      "SISER-8",
      "SISER-9",
    ],
    startsWith: ["STOCK-", "SUBSTOCK-", "PHTVSTOCK-"],
  };

  const combinedDecoSku3Regex = new RegExp("^(CD|CS|SD)[1-9]?$");

  data.products.forEach((product) => {
    const decoSku = product.sku;
    const decoSku3 = decoSku.slice(0, 3);
    const decoSku6 = decoSku.slice(0, 6);
    const decoSku8 = decoSku.slice(0, 8);
    const decoSku7 = decoSku.slice(0, 7);

    const matchesPattern =
      combinedDecoSku3Regex.test(decoSku3) ||
      skuPatterns.decoSku6.includes(decoSku6) ||
      skuPatterns.decoSku8.includes(decoSku8) ||
      skuPatterns.decoSku7.includes(decoSku7) ||
      skuPatterns.startsWith.some((prefix) => decoSku.startsWith(prefix));

    if (matchesPattern) {
      let productOptions = "";

      product.product_options.forEach((option) => {
        if (option.display_name === "Length") {
          productOptions = `${option.display_name}: ${option.display_value} `;
        }
      });

      const productObj = {
        orderId: data.orderObj.order_id,
        email: data.orderObj.email,
        firstName: data.orderObj.first_name,
        lastName: data.orderObj.last_name,
        sku: product.sku,
        quantity: product.quantity,
        productOptions,
        createdAt: data.createdAt,
        descriptions: product.name,
      };
      matchedProducts.push(productObj);
    }
  });

  return matchedProducts;
};

router.put("/item-queue/start/progress/:id", async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;

  try {
    await client.query("BEGIN");
    const updateItemQuery = `
        UPDATE item_queue_updated
        SET in_progress = TRUE
        WHERE id = $1
      `;
    const result = await client.query(updateItemQuery, [id]);

    if (result.rowCount === 0) {
      throw new Error(`Item with ID ${id} not found`);
    }

    await client.query("COMMIT");
    res.send({ success: true, message: "Item started successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error Starting Queue Item:", error);
    res.status(500).send({
      success: false,
      message: error.message || "Error starting item.",
    });
  } finally {
    client.release();
  }
});

router.put("/item-queue/send-back/progress/:id", async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;

  try {
    await client.query("BEGIN");
    const updateItemQuery = `
          UPDATE item_queue_updated
          SET in_progress = FALSE, is_completed = FALSE
          WHERE id = $1
        `;

    await client.query(updateItemQuery, [id]);
    await client.query("COMMIT");
    res.send({ success: true, message: "Item started successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("Error Starting Queue Item", error);
    res.status(500).send({ success: false, message: "Error starting item." });
  } finally {
    client.release();
  }
});

router.put("/item-queue/complete/:id", async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;

  try {
    await client.query("BEGIN");
    const updateItemQuery = `
        UPDATE item_queue_updated
        SET is_completed = TRUE, in_progress = FALSE
        WHERE id = $1
      `;

    await client.query(updateItemQuery, [id]);
    await client.query("COMMIT");
    res.send({ success: true, message: "Item started successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("Error Starting Queue Item", error);
    res.status(500).send({ success: false, message: "Error starting item." });
  } finally {
    client.release();
  }
});

router.put("/item-queue/update/priority/:id", async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  const { priority } = req.body;

  try {
    await client.query("BEGIN");
    const updateItemQuery = `
        UPDATE item_queue_updated
        SET priority = $1
        WHERE id = $2
      `;

    await client.query(updateItemQuery, [priority, id]);
    await client.query("COMMIT");
    res.send({ success: true, message: "Priority updated successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("Error Updating Priority", error);
    res
      .status(500)
      .send({ success: false, message: "Error updating priority." });
  } finally {
    client.release();
  }
});

router.put("/item-queue/send-back/complete/:id", async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;

  try {
    await client.query("BEGIN");
    const updateItemQuery = `
        UPDATE item_queue_updated
        SET is_completed = FALSE, in_progress = True
        WHERE id = $1
      `;

    await client.query(updateItemQuery, [id]);
    await client.query("COMMIT");
    res.send({ success: true, message: "Item started successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("Error Starting Queue Item", error);
    res.status(500).send({ success: false, message: "Error starting item." });
  } finally {
    client.release();
  }
});

router.delete("/item-queue/delete/:id", async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;

  try {
    await client.query("BEGIN");
    const deleteItemQuery = `
        DELETE FROM item_queue_updated
        WHERE id = $1
      `;

    await client.query(deleteItemQuery, [id]);
    await client.query("COMMIT");
    res.send({ success: true, message: "Item deleted successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("Error Deleting Queue Item", error);
    res.status(500).send({ success: false, message: "Error deleting item." });
  } finally {
    client.release();
  }
});

router.get("/item-queue/get", async (req, res) => {
  const { sort_by, order } = req.query;

  const validColumns = [
    "order_number",
    "sku",
    "qty",
    "created_at",
    "description",
    "priority",
    "in_progress",
    "is_completed",
  ];

  const validOrders = ["asc", "desc"];

  let query = `SELECT * FROM item_queue_updated`;

  if (
    sort_by &&
    validColumns.includes(sort_by) &&
    order &&
    validOrders.includes(order.toLowerCase())
  ) {
    const sortOrder = order.toUpperCase();
    query += ` ORDER BY ${sort_by} ${sortOrder}`;
  }

  try {
    const results = await pool.query(query);
    res.send(results.rows);
  } catch (error) {
    console.error("Error Getting Custom Queue Items", error);
    res.status(500).send({ error: "Error fetching queue items" });
  }
});

router.post("/item-queue/add", async (req, res) => {
  const client = await pool.connect();
  const { items } = req.body;

  try {
    await client.query("BEGIN");

    for (const item of items) {
      const {
        orderId,
        email,
        firstName,
        lastName,
        sku,
        quantity,
        productOptions,
        createdAt,
        descriptions,
      } = item;

      const queryText = `INSERT INTO item_queue_updated (order_number, email, first_name, last_name, sku, qty, product_length, created_at, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;`;

      const values = [
        orderId,
        email,
        firstName,
        lastName,
        sku,
        quantity,
        productOptions,
        createdAt,
        descriptions,
      ];

      await client.query(queryText, values);
    }
    await client.query("COMMIT");
  } catch (err) {
    console.log("Error adding items to queue:", err.message);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});

module.exports = router;
