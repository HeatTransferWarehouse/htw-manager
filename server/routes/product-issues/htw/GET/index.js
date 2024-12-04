const express = require("express");
const router = express.Router();
const pool = require("../../../../modules/pool");
const {
  getNoDescriptionSyncStatus,
  getNoImageAltSyncStatus,
} = require("../requestFunctions");

/* ----------- Descriptions ----------- */

// Get sync data for descriptions
router.get("/descriptions/syncs", async (req, res) => {
  const { is_last_sync } = req.query; // Extract query parameter

  try {
    // Base query
    let query = `
        SELECT date
        FROM last_product_sync
      `;

    // Add condition if is_last_sync is provided
    if (is_last_sync === "true") {
      query += `WHERE is_last_sync = true `;
    }

    // Always order by date descending
    query += `ORDER BY date DESC`;

    const result = await pool.query(query);

    // Respond with metadata and data
    res.status(200).json({
      message: "Sync dates retrieved successfully.",
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting sync dates:", error);
    res.status(500).json({ message: "Error getting sync dates" });
  }
});

// Get the current sync status for descriptions
router.get("/descriptions/syncs/status", async (req, res) => {
  try {
    const status = await getNoDescriptionSyncStatus();

    // Respond with the status
    res.status(200).json({
      message: "Description sync status retrieved successfully.",
      status: "success",
      data: status.isSyncing,
    });
  } catch (error) {
    console.error("Error getting description sync status:", error);
    res.status(500).json({ message: "Error getting description sync status" });
  }
});

// Get all products missing descriptions
router.get("/descriptions", async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM products_missing_descriptions
    `;
    const result = await pool.query(query);

    // Respond with metadata and data
    res.status(200).json({
      message: "Products missing descriptions retrieved successfully.",
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting products missing descriptions:", error);
    res.status(500).json({ message: "Error getting products" });
  }
});

/* ----------- Images without Alt Tags ----------- */

// Get count of products missing image alts

router.get("/images/count", async (req, res) => {
  try {
    const query = `
        SELECT COUNT(*) AS count
        FROM products_without_alt_htw
      `;

    const result = await pool.query(query);
    res.status(200).json({
      message: "Count of products without image alts retrieved successfully.",
      data: result.rows[0].count,
    });
  } catch (error) {
    console.error("Error getting count of products without image alts:", error);
    res
      .status(500)
      .json({ message: "Error getting count of products without image alts" });
  }
});

// Get data for images
router.get("/images", async (req, res) => {
  try {
    // Get the `limit` from the query string, and parse it to an integer
    const limit = parseInt(req.query.limit, 10);

    // Base query
    let query = `
          SELECT 
            pwa.id AS id,
            pwa.product_id as product_id,
            pwa.name AS product_name,
            pwa.categories AS categories,
            pwa.issue AS issue,
            COALESCE(
              json_agg(
                json_build_object(
                  'image_id', piwa.id,
                  'image_url', piwa.url,
                  'image_alt', piwa.alt
                )
              ) FILTER (WHERE piwa.id IS NOT NULL),
              '[]'
            ) AS images
          FROM 
            products_without_alt_htw pwa
          LEFT JOIN 
            products_images_without_alt_htw piwa
          ON 
            pwa.id = piwa.products_without_alt_htw_id
          GROUP BY 
            pwa.id, pwa.name
        `;

    // Add LIMIT clause if `limit` is provided and is a valid positive number
    if (!isNaN(limit) && limit > 0) {
      query += ` LIMIT $1`; // Use parameterized query to prevent SQL injection
    }

    // Execute the query with or without the limit parameter
    const result =
      limit > 0 ? await pool.query(query, [limit]) : await pool.query(query);

    res.status(200).json({
      message: "Products without image alts retrieved successfully.",
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting products with htw no image alts:", error);
    res
      .status(500)
      .json({ message: "Error getting products with htw no image alts" });
  }
});

// Get sync data for images
router.get("/images/syncs", async (req, res) => {
  const { is_last_sync } = req.query; // Extract query parameter

  try {
    // Base query
    let query = `
          SELECT date
          FROM last_product_images_sync_htw
        `;

    // Add condition if is_last_sync is provided
    if (is_last_sync === "true") {
      query += `WHERE is_last_sync = true `;
    }

    // Always order by date descending
    query += `ORDER BY date DESC`;

    const result = await pool.query(query);

    // Respond with metadata and data
    res.status(200).json({
      message: "Sync dates retrieved successfully.",
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting sync dates:", error);
    res.status(500).json({ message: "Error getting sync dates" });
  }
});

router.get("/images/syncs/status", async (req, res) => {
  try {
    const status = await getNoImageAltSyncStatus();
    res.status(200).json({
      message: "Images sync status retrieved successfully.",
      status: "success",
      data: status.isSyncing,
    });
  } catch (error) {
    console.error("Error getting description sync status:", error);
    res.status(500).json({ message: "Error getting description sync status" });
  }
});

module.exports = router;
