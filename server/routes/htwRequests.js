require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const sharp = require("sharp");
const fs = require("fs");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

router.post("/update-item-price", async (req, res) => {
  try {
    const data = req.body;
    const cartItem = data.cartItem;
    const cartItemId = data.cartItemId;
    const cartId = data.cartId;
    const itemPrice = data.itemPrice;

    const requestOrigin = req.get("origin");

    let hash, apiKey;

    if (
      requestOrigin ===
      "https://heat-transfer-warehouse-sandbox.mybigcommerce.com"
    ) {
      hash = process.env.SANDBOX_HASH;
      apiKey = process.env.SANDBOX_API_KEY;
    } else if (requestOrigin === "https://www.heattransferwarehouse.com") {
      hash = process.env.BG_AUTH_TOKEN;
      apiKey = process.env.STORE_HASH;
    } else {
      throw new Error("Invalid origin");
    }

    // URL for adding the item to the cart
    const updateUrl = `https://api.bigcommerce.com/stores/${hash}/v3/carts/${cartId}/items/${cartItemId}`;

    const headers = {
      "Content-Type": "application/json",
      "X-Auth-Token": apiKey,
    };

    const constructedCartItem = {
      line_item: {
        list_price: itemPrice,
        quantity: cartItem.quantity,
        variant_id: cartItem.variant_id,
        product_id: cartItem.product_id,
      },
    };

    const updateOptions = {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(constructedCartItem),
    };

    const updateResponse = await fetch(updateUrl, updateOptions);

    if (!updateResponse.ok) {
      const errorMessage = `Failed to update item price. Status: ${updateResponse}`;
      console.error(errorMessage);
      return res.status(updateResponse.status).json({
        message: errorMessage,
        success: false,
      });
    }

    const jsonResponse = await updateResponse.json();

    res.json({
      message: "Item price successfully updated",
      data: jsonResponse,
      success: true,
    });
  } catch (error) {
    console.error("Error processing cart data:", error);
    res.status(500).json({
      message: "Server error while processing cart data",
      error,
    });
  }
});

router.post(
  "/design-tool-image-upload",
  upload.single("image"),
  async (req, res) => {
    try {
      const filePath = req.file.path;
      let widthInInches, heightInInches;

      // Process the uploaded image with sharp
      const metadata = await sharp(filePath).metadata();

      const aspectRatio = metadata.width / metadata.height;
      if (metadata.density) {
        widthInInches = metadata.width / metadata.density;
        heightInInches = metadata.height / metadata.density;
      }

      // Send back metadata like dimensions, DPI, etc.
      res.json({
        success: true,
        width: metadata.width,
        height: metadata.height,
        aspectRatio: aspectRatio,
        widthInInches: widthInInches || null,
        heightInInches: heightInInches || null,
      });

      // Optionally delete the file after processing if you don't need it stored
      // fs.unlinkSync(filePath); // Uncomment if you want to delete the file after processing
    } catch (error) {
      console.error("Error uploading or processing image:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to upload image." });
    }
  }
);

router.post("/cart-transfer-price", async (req, res) => {
  try {
    const requestOrigin = req.get("origin");

    let hash, apiKey;

    if (
      requestOrigin ===
      "https://heat-transfer-warehouse-sandbox.mybigcommerce.com"
    ) {
      hash = process.env.SANDBOX_HASH;
      apiKey = process.env.SANDBOX_API_KEY;
    } else if (requestOrigin === "https://www.heattransferwarehouse.com") {
      hash = process.env.BG_AUTH_TOKEN;
      apiKey = process.env.STORE_HASH;
    } else {
      throw new Error("Invalid origin");
    }

    const data = req.body;
    const cartId = data.cartId;
    const cartItemId = data.cartItem.id;
    const cartItem = data.cartItem;
    const cartItemQty = data.qty;
    const cartItemPrice = data.price;

    const constructedCartItem = {
      line_item: {
        list_price: cartItemPrice,
        quantity: cartItemQty,
        variant_id: cartItem.variant_id,
        product_id: cartItem.product_id,
      },
    };

    const updateUrl = `https://api.bigcommerce.com/stores/${hash}/v3/carts/${cartId}/items/${cartItemId}`;

    const headers = {
      "Content-Type": "application/json",
      "X-Auth-Token": apiKey,
    };

    const updateOptions = {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(constructedCartItem),
    };

    const updateResponse = await fetch(updateUrl, updateOptions);

    if (!updateResponse.ok) {
      console.log(updateResponse);

      const errorMessage = `Failed to transfer cart item. Status: ${updateResponse}`;
      console.error(errorMessage);
      return res.status(updateResponse.status).json({
        message: errorMessage,
        success: false,
      });
    }

    const jsonResponse = await updateResponse.json();

    res.json({
      message: "Item price successfully updated",
      data: {
        cart: jsonResponse,
        cartItemId: cartItemId,
        qty: cartItemQty,
        cartItemPrice: cartItemPrice,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error processing cart data:", error);
    res.status(500).json({
      message: "Server error while processing cart data",
      error,
    });
  }
});

module.exports = router;
