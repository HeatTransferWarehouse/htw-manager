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

    if (!Array.isArray(products)) {
      return res
        .status(400)
        .send({ message: "Payload must be an array of products" });
    }

    const results = [];

    for (const product of products) {
      const url = `https://api.bigcommerce.com/stores/${
        storeMap[product.store].hash
      }/v3/catalog/products`;
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Auth-Token": storeMap[product.store].token,
      };

      const variants = product.variants || [];
      const options = product.options || [];
      const productWithoutVariants = {
        name: product.name,
        sku: product.sku,
        weight: 0,
        price: product.price,
        categories: product.categories || [],
        description: product.description || "",
        type: "physical",
        is_visible: false,
        is_featured: false,
        is_free_shipping: false,
      };

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(productWithoutVariants),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Failed to add product:", result);
        return res.status(result.status).send({
          message: result.title,
        });
      } else {
        await addProductVariantsToProduct(
          result.data.id,
          variants,
          options,
          product.store
        );

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

const addProductVariantsToProduct = async (
  productId,
  variants,
  options,
  store
) => {
  const url = `https://api.bigcommerce.com/stores/${storeMap[store].hash}/v3/catalog/products/${productId}/variants`;
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Auth-Token": storeMap[store].token,
  };

  const createdOptions = await createProductVariantOption(
    options,
    store,
    productId
  );

  const variantPromises = variants.map(async (variant) => {
    const variantData = {
      product_id: productId,
      sku: variant.sku,
      price: variant.price,
      option_values:
        variant.option_values.map((vO) => {
          const correspondingOption = createdOptions.find(
            (opt) =>
              opt.display_name === vO.option_display_name &&
              opt.type === vO.type &&
              opt.option_values.some((ov) => ov.label === vO.label)
          );

          return {
            option_display_name: vO.option_display_name,
            label: vO.label,

            option_id: correspondingOption.id,
            id: correspondingOption.option_values.find(
              (ov) => ov.label === vO.label
            ).id,
          };
        }) || [],
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(variantData),
    });
    const result = await response.json();
    if (!response.ok) {
      console.error("Failed to add variant:", result);
      throw new Error(`Failed to add variant: ${result.title}`);
    }
    return result.data;
  });
  try {
    const addedVariants = await Promise.all(variantPromises);
    return addedVariants;
  } catch (error) {
    console.error("Error adding variants to product:", error);
    await deleteProduct(productId, store);
    throw error;
  }
};

const createProductVariantOption = async (options, store, productId) => {
  const url = `https://api.bigcommerce.com/stores/${storeMap[store].hash}/v3/catalog/products/${productId}/options`;
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Auth-Token": storeMap[store].token,
  };

  const optionPromises = options.map(async (option) => {
    const optionData = {
      product_id: productId,
      display_name: option.display_name,
      type: option.type,
      option_values: option.option_values,
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(optionData),
    });
    const result = await response.json();
    if (!response.ok) {
      console.error("Failed to create product variant option:", result);
      throw new Error(
        `Failed to create product variant option: ${result.title}`
      );
    }
    return result.data;
  });
  try {
    const createdOptions = await Promise.all(optionPromises);
    return createdOptions;
  } catch (error) {
    console.error("Error creating product variant options:", error);
    await deleteProduct(productId, store);
    throw error;
  }
};

const deleteProduct = async (productId, store) => {
  const url = `https://api.bigcommerce.com/stores/${storeMap[store].hash}/v3/catalog/products?id:in=${productId}`;
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Auth-Token": storeMap[store].token,
  };
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to delete product:", errorData);
      throw new Error(`Failed to delete product: ${errorData.title}`);
    }
    console.log(`Product ${productId} deleted successfully`);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

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

const getProductsByCategoryId = async (categoryId, store) => {
  const token = await getValidApiToken(store);
  const url = `https://store-${storeMap[store].hash}-1.mybigcommerce.com/graphql`;
  const query = `
  query getCategoryProductsById($entityId: Int!) {
    site {
      category(entityId: $entityId) {
        products(first: 10) {
          edges {
            node {
              sku
              name
              variants {
                edges {
                  node {
                    sku
                    prices {
                      price {
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  } 
  `;

  const variables = {
    entityId: categoryId,
  };

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  };

  const response = await fetch(url, options);
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    return json.data.site.category.products.edges.map((edge) => edge.node);
  } catch (err) {
    console.error(
      "Failed to parse BigCommerce GraphQL response for category products. Raw response:"
    );
    console.error(text);
    throw err;
  }
};

router.post("/bc/products/sync", async (req, res) => {
  const skus = req.query.skus?.split(",").map((sku) => sku.trim());
});

const startPriceSync = async (categoryIds) => {
  const bcProducts = await getProductsByCategoryId(1611, "htw");

  const skuListWithPrices = bcProducts.map((product) => {
    return product.variants.edges.map((variant) => {
      return {
        sku: variant.node.sku,
        price: variant.node.prices.price.value,
      };
    });
  });

  const flattened = skuListWithPrices.reduce(
    (all, group) => all.concat(group),
    []
  );

  for (const item of flattened) {
    const partsToCheck = item.sku.split("-");
    const itemPrice = item.price;
    partsToCheck.forEach(async (part) => {
      try {
        const jdsData = await getJDSData([part]);
        if (jdsData[0].name === "unavailable") {
          console.log(`No JDS data for SKU ${part}`);
        } else {
          const jdsProduct = jdsData[0];
          const adjustedJDSPrice = jdsProduct.oneCase * 1.5;
          if (
            adjustedJDSPrice &&
            adjustedJDSPrice.toFixed(2) !== itemPrice.toFixed(2)
          ) {
            console.log(
              `Price mismatch for SKU ${part}: JDS price ${adjustedJDSPrice.toFixed(
                2
              )}, BC price ${itemPrice.toFixed(2)}`
            );
          } else {
            console.log(
              `SKU ${part} has matching prices: ${adjustedJDSPrice.toFixed(2)}`
            );
          }
        }
      } catch (error) {
        console.error(`Error fetching JDS data for SKU ${part}:`, error);
      }
    });
  }
};

module.exports = router;
