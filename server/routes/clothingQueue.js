require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();
const pool = require("../modules/pool");
const moment = require("moment-timezone");
const sharp = require("sharp");

const clothingCategoryIds = [
  468, 498, 556, 910, 911, 912, 913, 909, 527, 555, 508, 509, 507, 510, 597,
  586, 499, 515, 517, 516, 918, 919, 558, 917, 915, 916, 513, 514, 540, 731,
  659, 500, 520, 523, 522, 521, 612, 557, 519, 501, 528, 524, 525, 578, 529,
  526, 502, 533, 596, 532, 534, 569, 562, 531, 567, 503, 539, 535, 536, 580,
  538, 550, 537, 504, 541, 551, 542, 543, 565, 564, 544, 545, 552, 577, 553,
  573, 1319, 598, 583, 1354, 1355, 1356, 1357, 1358,
];

router.post("/order-webhook", function (req, res) {
  if (req.body.data && req.body.data.id) {
    const orderId = req.body.data.id;
    getOrderProducts(orderId);
  } else {
    // Handle error - ID was not found in request
    console.log("Order ID was not found in request for Queue");
    res.status(400).send("Order ID was not found");
  }
});

const getOrderProducts = async (orderId) => {
  try {
    const currentDate = getCurrentDate();
    console.log("Current Date:", currentDate);
    console.log("Order ID:", orderId);

    const response = await axios.get(
      `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders/${orderId}/products`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": process.env.BG_AUTH_TOKEN,
        },
      }
    );

    const products = response.data;

    const searchedProducts = await extractOrderProducts(
      products,
      currentDate,
      orderId
    );

    const dbItems = await axios.get(
      "https://admin.heattransferwarehouse.com/api/clothing-queue/items"
    );

    if (searchedProducts.length === 0)
      return {
        status: 304,
        message: "No products found on order.",
      };

    const filteredProducts = filterProducts(searchedProducts);

    const productsToAdd = await getProductsToAdd(filteredProducts, dbItems);

    if (productsToAdd.length === 0)
      return {
        status: 204,
        message: "No new products to add.",
      };

    try {
      await axios.post(
        `https://admin.heattransferwarehouse.com/api/clothing-queue/items`,
        {
          items: productsToAdd,
        }
      );
      return {
        status: 201,
        message: "Products added successfully!",
      };
    } catch (error) {
      if (error.response?.status === 409) {
        console.log("Duplicate entry detected.");
      } else {
        console.log("Error posting to add-queue-items:", error.message);
      }
    }
  } catch (error) {
    console.log("Error getting order products", error);
    return {
      status: 500,
      message: `Error getting order products. ${error.message}`,
    };
  }
};

const getCurrentDate = () => {
  const date = moment().tz("America/Chicago");
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = months[date.month()];
  const dayName = days[date.day()];
  const year = date.year();
  let day = date.date().toString().padStart(2, "0");
  const month = (date.month() + 1).toString().padStart(2, "0");
  let hours = date.hour().toString().padStart(2, "0");
  let afterFive = false;
  if (hours > 17) {
    afterFive = true;
  }

  if (afterFive) {
    day = (parseInt(day) + 1).toString().padStart(2, "0");
  }

  return `${month}/${day}/${year} or ${dayName}, ${monthName} ${day}, ${year}`;
};

const extractOrderProducts = async (products, currentDate, orderId) => {
  const searchedProducts = [];
  for (const product of products) {
    if (product.product_id !== 0) {
      const color = product.product_options.find(
        (option) => option.display_name === "Color"
      )?.display_value;

      const foundProduct = await getProductById(product.product_id);
      const swatchInfo = await getProductSwatchImage(
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
          swatchImage: swatchInfo.swatchImage,
          textColor: swatchInfo.textColor,
          size: product.product_options.find(
            (option) => option.display_name === "Size"
          )?.display_value,
          date: currentDate,
        };

        const blackKeywords = ["black", "dark", "coal", "onyx", "jet"];

        if (
          productObject.color &&
          blackKeywords.some((keyword) =>
            productObject.color.toLowerCase().includes(keyword)
          )
        ) {
          productObject.textColor = "white";
        }

        searchedProducts.push(productObject);
      }
    }
  }
  return searchedProducts;
};

const filterProducts = (products) => {
  return products
    .filter((product) => {
      return product.categories.some((categoryId) =>
        clothingCategoryIds.includes(categoryId)
      );
    })
    .map((product) => {
      return {
        ...product,
        size: product.size === undefined ? "NA" : product.size,
        color: product.color === undefined ? "NA" : product.color,
      };
    });
};

const getProductsToAdd = async (filteredProducts, dbItems) => {
  const productsToAdd = [];
  for (const filteredProduct of filteredProducts) {
    const match = dbItems.data.find((dbItem) => {
      return (
        dbItem.order_id === filteredProduct.orderId &&
        dbItem.product_id === filteredProduct.productId &&
        dbItem.color === filteredProduct.color &&
        dbItem.size === filteredProduct.size &&
        dbItem.qty === filteredProduct.quantity
      );
    });

    if (!match) {
      productsToAdd.push(filteredProduct);
    }
  }

  return productsToAdd;
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
    let textColor = "black"; // Default text color

    if (response && response.data && response.data.data) {
      response.data.data.forEach((option) => {
        if (option.display_name === "Color" && option.option_values) {
          option.option_values.forEach((value) => {
            if (
              value.label === name &&
              value.value_data &&
              value.value_data.image_url
            ) {
              swatchImage = value.value_data.image_url;
            }
          });
        }
      });

      if (swatchImage) {
        textColor = await determineTextColor(swatchImage);
      }
    }

    return { swatchImage, textColor };
  } catch (error) {
    console.log("Error getting product swatch image", error);
  }
};

const determineTextColor = async (imageUrl) => {
  try {
    // Fetch image data
    const { data } = await axios({
      url: imageUrl,
      responseType: "arraybuffer",
    });

    // Read and process the image using Sharp
    const image = sharp(data);

    // Get image metadata to find width and height
    const metadata = await image.metadata();

    // Get raw pixel data
    const rawImageData = await image.raw().ensureAlpha().toBuffer();

    let colorSum = 0;
    let pixelCount = 0;

    // Loop through each pixel (raw data is an array of RGBA values)
    for (let i = 0; i < rawImageData.length; i += 4) {
      const r = rawImageData[i];
      const g = rawImageData[i + 1];
      const b = rawImageData[i + 2];

      // Calculate brightness
      const brightness = (r + g + b) / 3;
      colorSum += brightness;
      pixelCount++;
    }

    // Calculate average brightness
    const avgBrightness = colorSum / pixelCount;

    // Return black or white text color based on brightness
    return avgBrightness > 127.5 ? "black" : "white";
  } catch (error) {
    console.error("Error determining text color:", error);
    return "black"; // Default to black if there is an error
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

router.post("/items/missing", async (req, res) => {
  try {
    const { orderId } = req.body;
    console.log("Order ID:", orderId);

    const response = await getOrderProducts(Number(orderId));
    res.send(response);
  } catch (error) {
    res.send({
      success: 500,
      message: `Error getting missing items. ${error.message}`,
    });
  }
});

router.get("/items", async (req, res) => {
  const client = await pool.connect();

  const { sort_by, order } = req.query;

  const validColumns = [
    "order_id",
    "sku",
    "qty",
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

router.post("/items", async (req, res) => {
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
        textColor,
      } = item;

      const insertQuery = `
          INSERT INTO clothing_queue (
            order_id, 
            product_id, 
            name, 
            sku, 
            qty, 
            color, 
            size,
            date,
            swatch_url,
            swatch_text_color
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
        textColor,
      ];

      await client.query(insertQuery, insertValues); // Execute the insert query
    }

    await client.query("COMMIT"); // Commit the transaction
    res.send({
      status: 201,
      message: "Item(s) added successfully.",
    });
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback transaction on error
    res.send({
      status: 500,
      message: `Error adding items. ${error.message}`,
    });
  } finally {
    client.release(); // Release client back to the pool
  }
});

router.delete("/items/:id", async (req, res) => {
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
      status: 204,
      message: "Item(s) deleted successfully.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error Deleting Item:", error);
    res.send({
      status: 500,
      message: `Error deleting item(s). ${error.message}`,
    });
  } finally {
    client.release();
  }
});

router.put("/items/ordered", async (req, res) => {
  const { idArray, bool } = req.body;

  if (
    !Array.isArray(idArray) ||
    idArray.some((id) => !Number.isInteger(Number(id)))
  ) {
    return res.send({
      status: 500,
      message: "Invalid ID format. ID must be an array of integers.",
    });
  }

  if (typeof bool !== "boolean") {
    return res.send({
      status: 500,
      message: "Invalid boolean value for is_ordered.",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updatePromises = idArray.map((id) =>
      client.query(
        `UPDATE clothing_queue SET is_ordered = $1, on_hold = FALSE WHERE id = $2`,
        [bool, Number(id)]
      )
    );

    await Promise.all(updatePromises);

    await client.query("COMMIT");
    res.send({
      status: 201,
      message: "Item(s) updated successfully.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating items:", error);
    res.send({
      status: 500,
      message: `Error updating items. ${error.message}`,
    });
  } finally {
    client.release();
  }
});

router.put("/items/hold", async (req, res) => {
  const { idArray } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const updatePromises = idArray.map((id) =>
      client.query(
        `UPDATE clothing_queue SET on_hold = TRUE, is_ordered = FALSE WHERE id = $1`,
        [Number(id)]
      )
    );

    await Promise.all(updatePromises);

    await client.query("COMMIT");
    res.send({
      status: 200,
      message: "Item(s) successfully put on hold.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating item:", error);
    res.send({
      status: 500,
      message: `Error updating items. ${error.message}`,
    });
  } finally {
    client.release();
  }
});

module.exports = router;
