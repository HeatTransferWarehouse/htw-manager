const express = require("express");
const router = express.Router();
const pool = require("../../../../modules/pool");

// Delete a product without image alt

router.delete("/images/:id", async (req, res) => {
  console.log(req.params.id);

  try {
    const query = `
            DELETE FROM products_without_alt_htw
            WHERE id = $1
            RETURNING *;
        `;

    const result = await pool.query(query, [req.params.id]);

    res.status(200).json({
      message: "Product without image alt deleted successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting product without image alt:", error);
    res
      .status(500)
      .json({ message: "Error deleting product without image alt" });
  }
});

module.exports = router;
