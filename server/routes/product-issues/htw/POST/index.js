const express = require("express");
const router = express.Router();
const pool = require("../../../../modules/pool");
const {
  getProductsWithImages,
  getNoImageAltSyncStatus,
  updateNoDescriptionSyncStatus,
  updateNoImageAltSyncStatus,
  getNoDescriptionSyncStatus,
  getProducts,
} = require("../requestFunctions");

/* ----------- Descriptions ----------- */

// Add new data for descriptions
router.post("/descriptions", async (req, res) => {
  try {
    const status = await getNoDescriptionSyncStatus();

    if (status.isSyncing) {
      return res
        .status(409)
        .json({ message: "Sync is already in progress.", status: "error" });
    }

    await updateNoDescriptionSyncStatus(true);

    const productsWithNoDescription = await getProducts();

    if (productsWithNoDescription.length === 0) {
      return res.status(200).json({
        message: "No products found to sync.",
        status: "success",
      });
    }

    await pool.query("BEGIN");

    // Delete previous entries before inserting new data
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

    await updateNoDescriptionSyncStatus(false);

    res.status(200).json({
      message: "Table synced successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Error syncing products with no descriptions:", error);

    await pool.query("ROLLBACK");

    await updateNoDescriptionSyncStatus(false);

    res.status(500).json({ message: "Error syncing table", status: "error" });
  }
});

// Add new sync data for no description products
router.post("/descriptions/syncs", async (req, res) => {
  try {
    const updateQuery = `
          UPDATE last_product_sync
          SET is_last_sync = false
        `;
    await pool.query(updateQuery);

    const insertQuery = `
      INSERT INTO last_product_sync (date, is_last_sync)
      VALUES (NOW(), true)
  `;
    const result = await pool.query(insertQuery);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error entering sync date:", error);
    res.status(500).json({ message: "Error setting sync date" });
  }
});

/* ----------- Images without Alt Tags ----------- */

router.post("/images", async (req, res) => {
  try {
    const status = await getNoImageAltSyncStatus();

    if (status.isSyncing) {
      return res
        .status(409)
        .json({ message: "Sync is already in progress.", status: "error" });
    }
    await updateNoImageAltSyncStatus(true);
    const products = await getProductsWithImages();

    if (products.length === 0) {
      await updateNoImageAltSyncStatus(false);
      return res.status(200).json({
        message: "No products found without alt image tags.",
        count: 0,
      });
    }

    // Start transaction
    await pool.query("BEGIN");

    // Clear existing data
    await pool.query("DELETE FROM products_without_alt_htw");
    await pool.query("DELETE FROM products_images_without_alt_htw");

    // Prepare bulk insert queries
    const mainTableInsertValues = [];
    const imagesTableInsertValues = [];
    const mainTableInsertQuery = `
        INSERT INTO products_without_alt_htw (product_id, name, categories, issue)
        VALUES ${products
          .map(
            (_, idx) =>
              `($${idx * 4 + 1}, $${idx * 4 + 2}, $${idx * 4 + 3}, $${
                idx * 4 + 4
              })`
          )
          .join(", ")}
        RETURNING id
      `;

    for (const product of products) {
      mainTableInsertValues.push(
        product.productId,
        product.name,
        product.categories,
        product.issue
      );
    }

    const mainTableResult = await pool.query(
      mainTableInsertQuery,
      mainTableInsertValues
    );

    // Map product IDs from the first insert to their images
    mainTableResult.rows.forEach((row, index) => {
      const product = products[index];
      for (const image of product.images) {
        imagesTableInsertValues.push(row.id, image.imageUrl, image.altText);
      }
    });

    if (imagesTableInsertValues.length > 0) {
      const imagesTableInsertQuery = `
          INSERT INTO products_images_without_alt_htw (products_without_alt_htw_id, url, alt)
          VALUES ${imagesTableInsertValues
            .map((_, idx) =>
              idx % 3 === 0 ? `($${idx + 1}, $${idx + 2}, $${idx + 3})` : null
            )
            .filter(Boolean)
            .join(", ")}
        `;
      await pool.query(imagesTableInsertQuery, imagesTableInsertValues);
    }

    // Commit transaction
    await pool.query("COMMIT");

    await updateNoImageAltSyncStatus(false);
    // Send response
    res.status(200).json({
      message:
        "Products and images with missing alt tags successfully updated.",
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching products with images:", error);

    // Rollback transaction on error
    await pool.query("ROLLBACK");

    await updateNoImageAltSyncStatus(false);

    res
      .status(500)
      .json({ message: "Error fetching products", status: "error" });
  }
});

//   Add new sync data for products missing alt tags
router.post("/images/syncs", async (req, res) => {
  try {
    const updateQuery = `
            UPDATE last_product_images_sync_htw
            SET is_last_sync = false
          `;
    await pool.query(updateQuery);

    const insertQuery = `
        INSERT INTO last_product_images_sync_htw (date, is_last_sync)
        VALUES (NOW(), true)
    `;
    const result = await pool.query(insertQuery);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error entering image sync date:", error);
    res.status(500).json({ message: "Error setting image sync date" });
  }
});

module.exports = router;
