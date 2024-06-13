require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();
const pool = require("../modules/pool");

const { Logtail } = require("@logtail/node");

const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

const axiosOptions = (method, resourcePath) => {
  const HEADERS = {
    "brightpearl-app-ref": process.env.BRIGHTPEARL_APP_REF,
    "brightpearl-account-token": process.env.BRIGHTPEARL_ACCOUNT_TOKEN,
  };
  return {
    method,
    url: `https://ws-use.brightpearl.com/public-api/heattransfer/${resourcePath}`,
    port: "443",
    //This is the only line that is new. `headers` is an object with the headers to request
    headers: HEADERS,
  };
};

const brightpearlAPI = (options) => {
  logtail.info(`${options.method} ${options.url}`);
  return axios({
    ...options,
  });
};

router.post("/create-order", function (req, res) {
  if (req.body.data && req.body.data.id) {
    const orderId = req.body.data.id;

    // Log the receipt of the order and intention to delay
    logtail.info(
      `Received order ID: ${orderId}. Will delay processing for 2 minutes.`
    );

    // Introduce a 2-minute delay before calling getBPOrderId
    setTimeout(() => {
      logtail.info(`Starting to process order ID: ${orderId} after delay.`);
      getBPOrderId(orderId).catch((error) => {
        logtail.error(`Error processing order ID: ${orderId}:`, error);
      });
    }, 2 * 60 * 1000); // 2 minutes in milliseconds

    // Respond immediately to acknowledge receipt
    res
      .status(200)
      .send("Order ID received. Processing will be delayed by 2 minutes.");
  } else {
    // Handle error - ID was not found in request
    logtail.error("Order ID was not found in request");
    res.status(400).send("Order ID was not found");
  }
});

const getBPOrderId = async (id) => {
  const options = axiosOptions(
    "GET",
    `order-service/order-search?externalRef=${id}`
  );
  const orderData = await brightpearlAPI(options)
    .then((r) => {
      return r.data.response.results[0][0];
    })
    .catch((err) => {
      console.log(`Error Getting Bp Order Id: ${id}`, err);
      return [];
    });

  await getBPOrderData({ BpId: orderData, BcId: id, BcOrderId: id });
};

const getBPOrderData = async (data) => {
  const options = axiosOptions("GET", `order-service/order/${data.BpId}`);
  const orderData = await brightpearlAPI(options)
    .then((r) => r.data)
    .catch((err) => {
      console.log("Error Getting BP Order Data", err);
      return [];
    });

  getBpOrderProductIds({ orderData, orderId: data.BcOrderId });
};

const getBpOrderProductIds = async (data) => {
  const rowItems = [];
  if (
    data.orderData.response &&
    data.orderData.response[0] &&
    data.orderData.response[0].orderRows
  ) {
    const orderRows = data.orderData.response[0].orderRows;

    // Iterate over orderRows
    Object.keys(orderRows).forEach((key) => {
      const order = orderRows[key];

      // Check if the row is a coupon or shipping row
      if (
        order.productName.includes("Coupon:") ||
        order.productName.includes("Shipping:")
      ) {
        return; // Skip this iteration if it's a coupon or shipping row
      }
      rowItems.push({
        productId: order.productId,
      });
    });
    if (rowItems.length > 0) {
      // Use Promise.all to wait for all product fetches
      const productPromises = rowItems.map((item) => getBpOrderProducts(item));

      let products = await Promise.all(productPromises);

      // Filter out any null values
      products = products.filter((product) => product !== null);

      getCorrectProductsInBC({ products, orderId: data.orderId });
    }
  } else {
    console.log("No order rows found in the response.");
  }
};

const getBpOrderProducts = async (data) => {
  const options = axiosOptions(
    "GET",
    `product-service/product/${data.productId}`
  );
  const productData = await brightpearlAPI(options)
    .then((r) => r.data)
    .catch((err) => {
      console.log("Error Getting BP Product Data", err);
      return null; // Return null if there is an error
    });

  const product = productData.response[0];

  if (product.productTypeId !== 11) {
    return null; // Return null if the product is not a 100 Product
  }

  return product; // Return the fetched product data
};

const getOrderDetailsFromBC = async (id) => {
  const headers = {
    "Content-Type": "application/json",
    "X-Auth-Token": process.env.BG_AUTH_TOKEN,
  };

  const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders/${id}/products`;
  const response = await axios
    .get(url, { headers })
    .then((r) => r.data)
    .catch((err) => {
      console.log(`Error Retrieving Product with id: ${id}`, err);

      return null;
    });

  return response;
};

const getCorrectProductsInBC = async (data) => {
  const bcOrderProducts = await getOrderDetailsFromBC(data.orderId);
  const bpOrderProducts = data.products;

  // Array to hold the matching products

  const bpSkus = new Set(
    bpOrderProducts.map((product) => product.identity.sku)
  );

  const matchingProducts = bcOrderProducts.filter((bcProduct) =>
    bpSkus.has(bcProduct.sku)
  );

  try {
    await axios.post(
      `https://admin.heattransferwarehouse.com/api/sff-queue/item-queue/add`,
      {
        items: matchingProducts,
      }
    );
    // await axios.post(`http://localhost:3000/api/sff-queue/item-queue/add`, {
    //   items: matchingProducts,
    // });
  } catch (error) {
    console.log("Error posting to add-queue-items:", error.message);
  }
};

router.get("/item-queue/get", async (req, res) => {
  const { sort_by, order } = req.query;

  // List of valid columns for sorting
  const validColumns = [
    "order_number",
    "sku",
    "qty",
    "created_at",
    "description",
    "priority",
    "in_progress",
    "is_complete",
  ];

  // List of valid sorting orders
  const validOrders = ["asc", "desc"];

  // Initialize base query
  let query = `
    SELECT 
        iq.*,
        json_agg(
            json_build_object(
                'id', po.id,
                'option_name', po.option_name,
                'option_value', po.option_value
            )
        ) AS product_options
    FROM 
        sff_item_queue iq
    LEFT JOIN 
        product_options po ON iq.id = po.item_queue_id
    GROUP BY 
        iq.id
  `;

  // Add ORDER BY clause if valid sort_by and order parameters are provided
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
      const { order_id, sku, quantity, name, product_options } = item;

      const insertItemQuery = `
            INSERT INTO sff_item_queue (order_number, sku, qty, description)
            VALUES ($1, $2, $3, $4)
            RETURNING id
          `;
      const itemValues = [order_id, sku, quantity, name];

      const resItem = await client.query(insertItemQuery, itemValues);
      const itemId = resItem.rows[0].id;

      const insertOptionQuery = `
            INSERT INTO product_options (option_name, option_value, item_queue_id)
            VALUES ($1, $2, $3)
          `;

      for (const option of product_options) {
        const { display_name, display_value } = option;
        await client.query(insertOptionQuery, [
          display_name,
          display_value,
          itemId,
        ]);
      }
    }

    await client.query("COMMIT");
    res.send({
      success: true,
      message: "Items and product options added successfully.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("Error Adding Custom Queue Items", error);
    res.status(500).send({
      success: false,
      message: "Error adding items and product options.",
    });
  } finally {
    client.release();
  }
});

router.put("/item-queue/start/progress/:id", async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;

  try {
    await client.query("BEGIN");
    const updateItemQuery = `
      UPDATE sff_item_queue
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
        UPDATE sff_item_queue
        SET in_progress = FALSE, is_complete = FALSE
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
      UPDATE sff_item_queue
      SET is_complete = TRUE, in_progress = FALSE
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
      UPDATE sff_item_queue
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
      UPDATE sff_item_queue
      SET is_complete = FALSE, in_progress = True
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
      DELETE FROM sff_item_queue
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

module.exports = router;
