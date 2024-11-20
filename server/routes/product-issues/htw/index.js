const express = require("express");
const router = express.Router();
const getRoutes = require("./GET/index"); // Import GET routes
const postRoutes = require("./POST/index"); // Import POST routes
const deleteRoutes = require("./DELETE/index"); // Import DELETE routes

// Use the GET and POST routers
router.use("/", getRoutes);
router.use("/", postRoutes);
router.use("/", deleteRoutes);

module.exports = router;
