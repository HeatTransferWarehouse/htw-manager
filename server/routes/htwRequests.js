require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

router.post("/update-item-price", async (req, res) => {
  try {
    const data = req.body;
    const cartItem = data.cartItem;
    const cartItemId = data.cartItemId;
    const cartId = data.cartId;
    const itemPrice = data.itemPrice;

    // URL for adding the item to the cart
    const updateUrl = `https://api.bigcommerce.com/stores/${process.env.SANDBOX_HASH}/v3/carts/${cartId}/items/${cartItemId}`;

    // // Headers for BigCommerce API requests
    const headers = {
      "Content-Type": "application/json",
      "X-Auth-Token": process.env.SANDBOX_API_KEY,
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

    // // // Send the request to BigCommerce to add the item to the cart
    const updateResponse = await fetch(updateUrl, updateOptions);

    // // Check if the response for adding the item is successful
    if (!updateResponse.ok) {
      const errorMessage = `Failed to update item price. Status: ${updateResponse}`;
      console.error(errorMessage);
      return res.status(updateResponse.status).json({
        message: errorMessage,
        success: false,
      });
    }

    // // Parse the JSON response from the "add to cart" request
    const jsonResponse = await updateResponse.json();

    // Respond with success and BigCommerce response
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

module.exports = router;
