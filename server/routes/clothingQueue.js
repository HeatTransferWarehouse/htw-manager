require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();
const pool = require("../modules/pool");
const moment = require("moment");

const clothingCategoryIds = [
  468, 498, 556, 910, 911, 912, 913, 909, 527, 555, 508, 509, 507, 510, 597,
  586, 499, 515, 517, 516, 918, 919, 558, 917, 915, 916, 513, 514, 540, 731,
  659, 500, 520, 523, 522, 521, 612, 557, 519, 501, 528, 524, 525, 578, 529,
  526, 502, 533, 596, 532, 534, 569, 562, 531, 567, 503, 539, 535, 536, 580,
  538, 550, 537, 504, 541, 551, 542, 543, 565, 564, 544, 545, 552, 577, 553,
  573, 1319, 598, 583,
];

const getOrderProducts = async (orderId) => {
  // Will Be implemented later

  //   const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  //   const months = [
  //     "Jan",
  //     "Feb",
  //     "Mar",
  //     "Apr",
  //     "May",
  //     "Jun",
  //     "Jul",
  //     "Aug",
  //     "Sep",
  //     "Oct",
  //     "Nov",
  //     "Dec",
  //   ];
  //   const monthName = months[date.getMonth()];
  //   const dayName = days[date.getDay()];
  // const hours = date.getHours().toString().padStart(2, "0");
  // const minutes = date.getMinutes().toString().padStart(2, "0");
  // const seconds = date.getSeconds().toString().padStart(2, "0");
  const date = new Date();
  const year = date.getFullYear();
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");

  const currentDate = `${month}/${day}/${year}`;
  try {
    const response = await axios.get(
      `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders/${orderId}/products`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": process.env.BG_AUTH_TOKEN,
        },
      }
    );

    const searchedProducts = [];

    const products = response.data;

    console.log(products);

    for (const product of products) {
      const color = product.product_options.find(
        (option) => option.display_name === "Color"
      )?.display_value;
      const foundProduct = await getProductById(product.product_id);
      const swatchImage = await getProductSwatchImage(
        foundProduct.data.id,
        color
      );
      if (foundProduct) {
        const productObject = {
          orderId: orderId,
          productId: foundProduct.data.id,
          name: foundProduct.data.name,
          sku: foundProduct.data.sku,
          quantity: product.quantity,
          categories: foundProduct.data.categories,
          color,
          swatchImage,
          size: product.product_options.find(
            (option) => option.display_name === "Size"
          )?.display_value,
          date: currentDate,
        };
        searchedProducts.push(productObject);
      }
    }

    if (searchedProducts.length > 0) {
      const filteredProducts = searchedProducts.filter((product) => {
        // Check if product categories include any of the clothing category IDs
        return product.categories.some((categoryId) =>
          clothingCategoryIds.includes(categoryId)
        );
      });

      console.log(filteredProducts);

      try {
        // await axios.post(
        //   `https://admin.heattransferwarehouse.com/api/sff-queue/item-queue/add`,
        //   {
        //     items: matchingProducts,
        //   }
        // );
        await axios.post(`http://localhost:3000/api/clothing-queue/item/add`, {
          items: filteredProducts,
        });
      } catch (error) {
        console.log("Error posting to add-queue-items:", error.message);
      }
    }
  } catch (error) {
    console.log("Error getting order products", error);
  }
};

const getProductSwatchImage = async (productId, name) => {
  try {
    const response = await axios.get(
      `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v3/catalog/products/${productId}/options`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": process.env.BG_AUTH_TOKEN,
        },
      }
    );

    let swatchImage = "";

    response.data.data.map((option) => {
      if (option.display_name === "Color") {
        option.option_values.map((value) => {
          if (value.label === name) {
            swatchImage = value.value_data.image_url;
          }
        });
      }
    });

    return swatchImage;
  } catch (error) {
    console.log("Error getting product swatch image", error);
  }
};

const getProductById = async (id) => {
  try {
    const response = await axios.get(
      `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v3/catalog/products/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": process.env.BG_AUTH_TOKEN,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("Error getting order products", error);
  }
};

router.get("/items/get", async (req, res) => {
  const client = await pool.connect();

  const { sort_by, order } = req.query;

  const validColumns = [
    "order_id",
    "sku",
    "quantity",
    "date",
    "name",
    "color",
    "size",
  ];

  const validOrders = ["asc", "desc"];

  let query = `SELECT * FROM clothing_queue`;

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
    console.error("Error fetching clothing queue items:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching clothing queue items.",
    });
  } finally {
    client.release();
  }
});

router.post("/item/add", async (req, res) => {
  const { items } = req.body;

  const client = await pool.connect(); // Get a client from the pool

  try {
    await client.query("BEGIN"); // Start transaction

    for (const item of items) {
      const {
        orderId,
        productId,
        name,
        sku,
        quantity,
        color,
        size,
        date,
        swatchImage,
      } = item;

      const insertQuery = `
          INSERT INTO clothing_queue (
            order_id, 
            product_id, 
            name, 
            sku, 
            quantity, 
            color, 
            size,
            date,
            swatch_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;

      const insertValues = [
        orderId,
        productId,
        name,
        sku,
        quantity,
        color,
        size, // Convert options to JSON string
        date, // Convert date to ISO format
        swatchImage,
      ];

      await client.query(insertQuery, insertValues); // Execute the insert query
    }

    await client.query("COMMIT"); // Commit the transaction
    res.send({
      success: true,
      message: "Items added successfully.",
    });
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback transaction on error
    console.error("Error Adding Items:", error);
    res.status(500).send({
      success: false,
      message: "Error adding items.",
    });
  } finally {
    client.release(); // Release client back to the pool
  }
});

router.delete("/item/delete/:id", async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const deleteQuery = `
            DELETE FROM clothing_queue
            WHERE id = $1
        `;

    await client.query(deleteQuery, [id]);

    await client.query("COMMIT");
    res.send({
      success: true,
      message: "Item deleted successfully.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error Deleting Item:", error);
    res.status(500).send({
      success: false,
      message: "Error deleting item.",
    });
  } finally {
    client.release();
  }
});

router.put("/item/update/ordered/:id", async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updateQuery = `
            UPDATE clothing_queue
            SET is_ordered = true
            WHERE id = $1
        `;

    await client.query(updateQuery, [id]);

    await client.query("COMMIT");
    res.send({
      success: true,
      message: "Item updated successfully.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error Updating Item:", error);
    res.status(500).send({
      success: false,
      message: "Error updating item.",
    });
  } finally {
    client.release();
  }
});

getOrderProducts(3539880);

module.exports = router;
