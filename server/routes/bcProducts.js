const express = require("express");
const router = express.Router();
const pool = require("../modules/pool");
const fetch = require("node-fetch");

let htwSyncStatus = {
  isSyncing: false,
  message: false,
};

let sffSyncStatus = {
  isSyncing: false,
  message: false,
};

// Function to fetch category name
const getCategoryName = async (categoryId) => {
  const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v3/catalog/categories/${categoryId}?include_fields=name`;

  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Auth-Token": process.env.BG_AUTH_TOKEN,
    },
  };
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data.data.name;
  } catch (error) {
    console.error(`Error fetching category for ID ${categoryId}:`, error);
    return null;
  }
};

// Function to fetch products with no description
const getProducts = async () => {
  const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v3/catalog/products?include_fields=description,name,categories&limit=100&is_visible=true`;

  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Auth-Token": process.env.BG_AUTH_TOKEN,
    },
  };

  const productsWithNoDescription = [];
  let currentPage = 1;
  let totalPages;

  try {
    do {
      const response = await fetch(`${url}&page=${currentPage}`, options);
      const data = await response.json();

      for (const product of data.data) {
        if (
          !product.description ||
          product.description.trim().length === 0 ||
          !/<\/h[1-6]>/i.test(product.description)
        ) {
          const categoryNames = await Promise.all(
            product.categories.map((categoryId) => getCategoryName(categoryId))
          );

          productsWithNoDescription.push({
            productId: product.id,
            name: product.name,
            description: product.description,
            categories: categoryNames.filter(Boolean),
          });
        }
      }

      totalPages = data.meta.pagination.total_pages;
      currentPage++;
    } while (currentPage <= totalPages);

    return productsWithNoDescription;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

// Route to sync products with no descriptions
router.post("/empty-descriptions/sync", async (req, res) => {
  if (htwSyncStatus.isSyncing) {
    return res.status(409).json({ message: "Sync is already in progress." });
  }

  htwSyncStatus = { isSyncing: true, message: "Syncing products" };

  try {
    const productsWithNoDescription = await getProducts();

    if (productsWithNoDescription.length === 0) {
      htwSyncStatus = {
        isSyncing: false,
        message: "No products to sync.",
      };

      return res.status(200).json({
        message: "No products found to sync.",
        count: 0,
      });
    }
    await pool.query("BEGIN");

    await pool.query("DELETE FROM products_missing_descriptions");

    const insertQuery = `
      INSERT INTO products_missing_descriptions (product_id, name, description, categories)
      VALUES ($1, $2, $3, $4)
    `;

    for (const product of productsWithNoDescription) {
      await pool.query(insertQuery, [
        product.productId,
        product.name,
        product.description,
        product.categories,
      ]);
    }

    await pool.query("COMMIT");

    htwSyncStatus = {
      isSyncing: false,
      message: "Sync completed successfully.",
    };

    res.status(200).json({
      message: "Table synced successfully",
      count: productsWithNoDescription.length,
    });
  } catch (error) {
    console.error("Error syncing products with no descriptions:", error);

    await pool.query("ROLLBACK");

    htwSyncStatus = {
      isSyncing: false,
      message: "Error during sync.",
    };

    res.status(500).json({ message: "Error syncing table" });
  }
});

router.post("/populate-sync-data", async (req, res) => {
  try {
    const updateQuery = `
        UPDATE last_product_sync
        SET is_last_sync = false
      `;
    await pool.query(updateQuery);

    const insertQuery = `
    INSERT INTO last_product_sync (date, is_last_sync)
    VALUES (NOW(), true)
    RETURNING date, is_last_sync
`;
    const result = await pool.query(insertQuery);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error entering sync date:", error);
    res.status(500).json({ message: "Error setting sync date" });
  }
});

router.get("/syncs/last", async (req, res) => {
  try {
    const query = `
      SELECT date
      FROM last_product_sync
      WHERE is_last_sync = true
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error getting last sync date:", error);
    res.status(500).json({ message: "Error getting last sync date" });
  }
});

router.get("/syncs/all", async (req, res) => {
  try {
    const query = `
      SELECT date
      FROM last_product_sync_sff
      ORDER BY date DESC
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error getting all sync dates:", error);
    res.status(500).json({ message: "Error getting all sync dates" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const query = `
        SELECT *
        FROM products_missing_descriptions
      `;

    const result = await pool.query(query);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error getting products with limit:", error);
    res.status(500).json({ message: "Error getting products" });
  }
});

router.get("/sync/status", (req, res) => {
  res.status(200).json(htwSyncStatus);
});

/* ----------------- SFF Routes ----------------- */

const getSffCategoryName = async (categoryId) => {
  const url = `https://api.bigcommerce.com/stores/${process.env.SFF_STORE_HASH}/v3/catalog/categories/${categoryId}?include_fields=name`;

  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Auth-Token": process.env.SFF_AUTH_TOKEN,
    },
  };
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data.data.name;
  } catch (error) {
    console.error(`Error fetching category for ID ${categoryId}:`, error);
    return null;
  }
};

const getSffProducts = async () => {
  const url = `https://api.bigcommerce.com/stores/${process.env.SFF_STORE_HASH}/v3/catalog/products?include_fields=description,name,categories&limit=100&is_visible=true`;

  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Auth-Token": process.env.SFF_AUTH_TOKEN,
    },
  };

  const productsWithNoDescription = [];
  let currentPage = 1;
  let totalPages;

  try {
    do {
      const response = await fetch(`${url}&page=${currentPage}`, options);
      const data = await response.json();

      for (const product of data.data) {
        if (
          !product.description ||
          product.description.trim().length === 0 ||
          !/<\/h[1-6]>/i.test(product.description)
        ) {
          const categoryNames = await Promise.all(
            product.categories.map((categoryId) =>
              getSffCategoryName(categoryId)
            )
          );

          productsWithNoDescription.push({
            productId: product.id,
            name: product.name,
            description: product.description,
            categories: categoryNames.filter(Boolean),
          });
        }
      }

      totalPages = data.meta.pagination.total_pages;
      currentPage++;
    } while (currentPage <= totalPages);

    return productsWithNoDescription;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

router.post("/sff/empty-descriptions/sync", async (req, res) => {
  if (sffSyncStatus.isSyncing) {
    return res.status(409).json({ message: "Sync is already in progress." });
  }

  sffSyncStatus = { isSyncing: true, message: "Syncing products" };

  try {
    const productsWithNoDescription = await getSffProducts();

    if (productsWithNoDescription.length === 0) {
      sffSyncStatus = {
        isSyncing: false,
        message: "No products to sync.",
      };

      return res.status(200).json({
        message: "No products found to sync.",
        count: 0,
      });
    }
    await pool.query("BEGIN");

    await pool.query("DELETE FROM products_missing_descriptions_sff");

    const insertQuery = `
      INSERT INTO products_missing_descriptions_sff (product_id, name, description, categories)
      VALUES ($1, $2, $3, $4)
    `;

    for (const product of productsWithNoDescription) {
      await pool.query(insertQuery, [
        product.productId,
        product.name,
        product.description,
        product.categories,
      ]);
    }
    await pool.query("COMMIT");

    sffSyncStatus = {
      isSyncing: false,
      message: "Sync completed successfully.",
    };

    res.status(200).json({
      message: "Table synced successfully",
      count: productsWithNoDescription.length,
    });
  } catch (error) {
    console.error("Error syncing products with no descriptions:", error);

    await pool.query("ROLLBACK");

    sffSyncStatus = {
      isSyncing: false,
      message: "Error during sync.",
    };

    res.status(500).json({ message: "Error syncing table" });
  }
});

router.post("/sff/populate-sync-data", async (req, res) => {
  try {
    const updateQuery = `
        UPDATE last_product_sync_sff
        SET last_sync = false
      `;
    await pool.query(updateQuery);

    const insertQuery = `
    INSERT INTO last_product_sync_sff (date, last_sync)
    VALUES (NOW(), true)
    RETURNING date, last_sync
`;
    const result = await pool.query(insertQuery);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error entering sync date:", error);
    res.status(500).json({ message: "Error setting sync date" });
  }
});

router.get("/sff/syncs/last", async (req, res) => {
  try {
    const query = `
      SELECT date
      FROM last_product_sync_sff
      WHERE last_sync = true
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error getting last sync date:", error);
    res.status(500).json({ message: "Error getting last sync date" });
  }
});

router.get("/sff/syncs/all", async (req, res) => {
  try {
    const query = `
      SELECT date
      FROM last_product_sync_sff
      ORDER BY date DESC
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error getting all sync dates:", error);
    res.status(500).json({ message: "Error getting all sync dates" });
  }
});

router.get("/sff/all", async (req, res) => {
  try {
    const query = `
        SELECT *
        FROM products_missing_descriptions_sff
      `;

    const result = await pool.query(query);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error getting products with limit:", error);
    res.status(500).json({ message: "Error getting products" });
  }
});

router.get("/sff/sync/status", (req, res) => {
  res.status(200).json(sffSyncStatus);
});

module.exports = router;
