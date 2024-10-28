require("dotenv").config();
const express = require("express");
const router = express.Router();
const fs = require("fs").promises; // Use the Promise-based fs API
const multer = require("multer");
const { exec } = require("child_process");
const PSD = require("psd"); // Import psd.js
const path = require("path");
const sizeOf = require("image-size"); // Import image-size package for getting dimensions

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Function to save buffer to file
const saveBufferToFile = (buffer, filename) => {
  const filePath = path.join("uploads", filename);
  return fs.writeFile(filePath, buffer).then(() => filePath);
};

router.post("/generate-preview", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileBuffer = file.buffer; // Access the file buffer
    const fileExtension = file.originalname.split(".").pop().toLowerCase();
    const originalFileName = file.originalname;

    let aspectRatio;
    let base64Image;

    // Handle PNG, JPEG, JPG, SVG (already images, no conversion needed)
    if (["png", "jpeg", "jpg", "svg"].includes(fileExtension)) {
      // Get the dimensions of the image buffer
      const dimensions = sizeOf(fileBuffer);
      aspectRatio = dimensions.width / dimensions.height;

      // Convert the image buffer to a base64 string
      base64Image = fileBuffer.toString("base64");

      // Send the response with the aspect ratio and image data
      return res.json({
        image: `data:${file.mimetype};base64,${base64Image}`,
        aspectRatio: aspectRatio,
      });
    }

    // Handle EPS and AI files with ImageMagick
    else if (fileExtension === "eps" || fileExtension === "ai") {
      // Save the buffer to disk before processing with ImageMagick
      const filePath = await saveBufferToFile(fileBuffer, originalFileName);
      const previewPath = `uploads/${file.filename}.png`;

      exec(
        `magick ${filePath} -density 300 -quality 85 ${previewPath}`,
        async (error, stdout, stderr) => {
          if (error) {
            console.error("Error processing EPS/AI file:", stderr);
            return res
              .status(500)
              .json({ message: "Failed to generate preview" });
          }

          // Calculate the aspect ratio for the generated preview image
          const dimensions = sizeOf(previewPath);
          aspectRatio = dimensions.width / dimensions.height;

          // Read the generated preview image as a base64 string
          const previewBuffer = await fs.readFile(previewPath);
          base64Image = previewBuffer.toString("base64");

          res.json({
            image: `data:image/png;base64,${base64Image}`,
            aspectRatio: aspectRatio,
          });

          // Clean up temporary files
          await fs.unlink(filePath);
          await fs.unlink(previewPath);
        }
      );
    }

    // Handle PSD files with psd.js
    else if (fileExtension === "psd") {
      // Save the buffer to disk before processing with psd.js
      const filePath = await saveBufferToFile(fileBuffer, originalFileName);

      const psd = await PSD.fromFile(filePath);
      psd.parse();

      const previewPath = `uploads/${file.filename}.png`;
      psd.image
        .saveAsPng(previewPath)
        .then(async () => {
          const dimensions = sizeOf(previewPath);
          aspectRatio = dimensions.width / dimensions.height;

          // Read the PNG file as a base64 string
          const previewBuffer = await fs.readFile(previewPath);
          base64Image = previewBuffer.toString("base64");

          res.json({
            image: `data:image/png;base64,${base64Image}`,
            aspectRatio: aspectRatio,
          });

          // Clean up temporary files
          await fs.unlink(filePath);
          await fs.unlink(previewPath);
        })
        .catch((error) => {
          console.error("Error processing PSD file:", error);
          res.status(500).json({ message: "Failed to generate PSD preview" });
        });
    }

    // Unsupported file type
    else {
      return res.status(400).json({ message: "Unsupported file type" });
    }
  } catch (error) {
    console.error("Error generating preview:", error);
    res.status(500).json({ message: "Server error while generating preview" });
  }
});

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
      hash = process.env.STORE_HASH;
      apiKey = process.env.BG_AUTH_TOKEN;
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
      console.error("Failed to update item price", updateResponse);
      return res.status(updateResponse.status).json({
        message: updateResponse,
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
      hash = process.env.STORE_HASH;
      apiKey = process.env.BG_AUTH_TOKEN;
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

router.post("/cart-related-products", async (req, res) => {
  try {
    const { productIds, token, query } = req.body;

    // Fetch GraphQL data
    const response = await fetch(`https://heattransferwarehouse.com/graphql`, {
      method: "POST",
      credentials: "same-origin", // You might not need this for external domains
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: query,
        variables: {
          entityId: productIds[0],
        },
      }),
    });

    if (!response.ok) {
      // Handle non-200 HTTP responses
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Ensure the structure is as expected
    const relatedProducts =
      result.data?.site?.product?.relatedProducts?.edges || [];

    // Build HTML from related products
    const productsHtml = buildRelatedProductsHTML(relatedProducts);

    res.send(productsHtml); // Send the HTML response to the client
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error while processing cart data",
      error: err.message || err,
    });
  }
});

// Build related products HTML
const buildRelatedProductsHTML = (products) => {
  const relatedProducts = products.map((product) => {
    return buildRelatedProductElement(product.node);
  });

  return relatedProducts.join("");
};

// Build individual product HTML
const buildRelatedProductElement = (product) => {
  return `
    <article class="card">
      <a href="${product.path}">
        <figure class="card-figure">
          <div class="card-image-container">
            <img src="${product.defaultImage.url}" alt="${
    product.defaultImage.altText ? product.defaultImage.altText : product.name
  }" />
          </div>
        </figure>
        <div class="card-body">
          <p class="card-text">${product.brand.name}</p>
          <span class="card-title">${product.name}</span>
          <div class="card-text">
            <div class="price-section price-section--withoutTax">
              ${
                product.prices.priceRange
                  ? `<span class="price price--withoutTax">$${product.prices.priceRange.min.value.toFixed(
                      2
                    )} - $${product.prices.priceRange.max.value.toFixed(
                      2
                    )}</span>`
                  : `<span class="price price--withoutTax">$${product.prices.price.value.toFixed(
                      2
                    )}</span>`
              }
            </div>
          </div>
        </div>
      </a>
    </article>
  `;
};

module.exports = router;
