const express = require("express");
const router = express.Router();

const storeMap = {
  sandbox: {
    hash: process.env.SANDBOX_HASH,
    token: process.env.SANDBOX_API_KEY,
  },
  htw: {
    hash: process.env.STORE_HASH,
    token: process.env.BG_AUTH_TOKEN,
  },
  sff: {
    hash: process.env.SFF_STORE_HASH,
    token: process.env.SFF_AUTH_TOKEN,
  },
};

// Store API tokens and expiry times by store key
const apiTokens = {
  sandbox: { token: null, expiry: null },
  htw: { token: null, expiry: null },
  sff: { token: null, expiry: null },
};

// Request a new token for a given store
const getApiToken = async (storeKey) => {
  const storeData = storeMap[storeKey];
  if (!storeData) throw new Error(`Invalid store key: ${storeKey}`);

  const expiresAtUnix = Math.floor(Date.now() / 1000) + 1800;

  const url = `https://api.bigcommerce.com/stores/${storeData.hash}/v3/storefront/api-token`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Auth-Token": storeData.token,
      },
      body: JSON.stringify({
        channel_id: 1, // Adjust if needed
        expires_at: expiresAtUnix,
      }),
    });

    const json = await response.json();

    if (!json.data?.token) {
      throw new Error(
        `Failed to retrieve token from BigCommerce for ${storeKey}`
      );
    }

    apiTokens[storeKey] = {
      token: json.data.token,
      expiry: expiresAtUnix * 1000, // convert to ms
    };

    return json.data.token;
  } catch (err) {
    console.error(`Error fetching API token for ${storeKey}:`, err);
    throw err;
  }
};

// Get a valid (possibly cached) token for a given store
const getValidApiToken = async (storeKey) => {
  const { token, expiry } = apiTokens[storeKey] || {};
  const bufferTime = 60 * 1000; // 1 min buffer

  const isExpired = !token || Date.now() >= expiry - bufferTime;

  if (isExpired) {
    return await getApiToken(storeKey);
  }

  return token;
};

const getJDSData = async (skus) => {
  const raw = JSON.stringify({
    token: process.env.JDS_API_KEY,
    skus,
  });

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: raw,
    redirect: "follow",
  };

  return fetch(
    "https://api.jdsapp.com/get-product-details-by-skus",
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => {
      if (!result || result.length === 0) {
        return console.log(
          `No product data found from SKU(s) ${skus.join(", ")}`
        );
      }
      return result;
    })
    .catch((error) => {
      console.error("Error fetching JDS data:", error);
      throw error;
    });
};

router.get("/products", async (req, res) => {
  try {
    const skus = req.query.skus?.split(",").map((sku) => sku.trim());

    const data = await getJDSData(skus);

    res
      .send({
        message: "Product data fetched successfully",
        products: data,
      })
      .status(200);
  } catch (error) {
    console.error("Error in /products route:", error);
    res
      .send({
        message: "Error fetching product data",
        error: error.message || "Unknown error",
      })
      .status(500);
  }
});

router.post("/bc/products/add", async (req, res) => {
  try {
    const products = req.body.products;
    const store = req.body.store || "sandbox";

    if (!Array.isArray(products)) {
      return res
        .status(400)
        .send({ message: "Payload must be an array of products" });
    }

    const url = `https://api.bigcommerce.com/stores/${storeMap[store].hash}/v3/catalog/products`;
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Auth-Token": storeMap[store].token,
    };

    const results = [];

    for (const product of products) {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(product),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Failed to add product:", result);
        return res.status(result.status).send({
          message: result.title,
        });
      } else {
        results.push({ success: true, product: result.data });
      }
    }

    return res.status(200).send({
      message: "Finished processing product batch",
      results,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Error adding products to BigCommerce",
      error: error.message,
    });
  }
});

router.get("/bc/categories", async (req, res) => {
  const store = req.query.store || "sandbox";

  const token = await getValidApiToken(store);

  const url = `https://store-${storeMap[store].hash}-1.mybigcommerce.com/graphql`;
  try {
    const query = `
    query CategoryTree3LevelsDeep {
        site {
            categoryTree {
            ...CategoryFields
                children {
                    ...CategoryFields
                    children {
                    ...CategoryFields
                        children {
                            ...CategoryFields
                        }
                    }
                }
            }
        }
    }

    fragment CategoryFields on CategoryTreeItem {
        name
        entityId
    }
    `;

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
    };

    const response = await fetch(url, options);

    const text = await response.text();

    try {
      const json = JSON.parse(text);
      res.send({
        message: "Product data fetched successfully",
        categories: json,
      });
    } catch (err) {
      console.error(
        "Failed to retrieve BigCommerce GraphQL response for category tree. Raw response:"
      );
      console.error(text);
      throw err;
    }
  } catch (error) {
    console.error("Error in /bc/categories route:", error);
    res.send({
      message: "Error fetching Big Commerce Category data",
      error: error.message || "Unknown error",
    });
  }
});

module.exports = router;
