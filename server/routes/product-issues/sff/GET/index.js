const express = require("express");
const router = express.Router();
const pool = require("../../../../modules/pool");
const {
  getNoDescriptionSyncStatus,
  getNoImageAltSyncStatus,
} = require("../requestsFunctions");

/* ----------- SFF Descriptions ----------- */

// Get all products missing descriptions
router.get("/descriptions", async (req, res) => {
  try {
    const query = `
          SELECT *
          FROM products_missing_descriptions_sff
        `;

    const result = await pool.query(query);

    res.status(200).json({
      message: "Products missing descriptions retrieved successfully.",
      status: "success",
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting products with limit:", error);
    res.status(500).json({
      message: "Error getting products",
      status: "error",
      data: error,
    });
  }
});

// Get the sync data descriptions
router.get("/descriptions/syncs", async (req, res) => {
  const { is_last_sync } = req.query; // Extract query parameter

  try {
    // Base query
    let query = `
            SELECT date
            FROM last_product_sync_sff
          `;

    // Add condition if is_last_sync is provided
    if (is_last_sync === "true") {
      query += `WHERE last_sync = true `;
    }

    // Always order by date descending
    query += `ORDER BY date DESC`;

    const result = await pool.query(query);

    // Respond with metadata and data
    res.status(200).json({
      message: "Sync dates retrieved successfully.",
      status: "success",
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting sync dates:", error);
    res.status(500).json({
      message: "Error getting sync dates",
      status: "error",
      data: error,
    });
  }
});

router.get("/descriptions/syncs/status", async (req, res) => {
  try {
    const status = await getNoDescriptionSyncStatus();
    res.status(200).json({
      message: "Images sync status retrieved successfully.",
      status: "success",
      data: status.isSyncing,
    });
  } catch (error) {
    console.error("Error getting description sync status:", error);
    res.status(500).json({
      message: "Error getting description sync status",
      status: "error",
      data: error,
    });
  }
});

/* ----------- Images without Alt Tags ----------- */

// Get data for images
router.get("/images", async (req, res) => {
  try {
    const query = `
          SELECT 
            pwa.id AS id,
            pwa.product_id AS product_id,
            pwa.name AS product_name,
            pwa.categories AS categories,
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
            products_without_alt_sff pwa
          LEFT JOIN 
            products_images_without_alt_sff piwa
          ON 
            pwa.id = piwa.products_without_alt_sff_id
          GROUP BY 
            pwa.id, pwa.name;
        `;

    const result = await pool.query(query);

    res.status(200).json({
      message: "Products without image alts retrieved successfully.",
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting products with sff no image alts:", error);
    res
      .status(500)
      .json({ message: "Error getting products with sff no image alts" });
  }
});

// Get sync data for images
router.get("/images/syncs", async (req, res) => {
  const { is_last_sync } = req.query; // Extract query parameter

  try {
    // Base query
    let query = `
          SELECT date
          FROM last_product_images_sync_sff
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
