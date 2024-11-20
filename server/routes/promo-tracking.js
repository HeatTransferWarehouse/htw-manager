require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();
const fetch = require("node-fetch");

// const formatISODate = (date) => {
//   return new Date(date).toISOString(); // Ensures the correct format
// };

// const getApiToken = async () => {
//   try {
//     let url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v3/storefront/api-token-customer-impersonation`;

//     let options = {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//         "X-Auth-Token": process.env.BG_AUTH_TOKEN,
//       },
//       body: JSON.stringify({
//         channel_id: 1, // Make sure this is the correct channel ID
//         expires_at: 1885635176, // Ensure this is a valid Unix timestamp
//       }),
//     };

//     const response = await fetch(url, options);
//     const json = await response.json();
//     return json; // Return the token data
//   } catch (err) {
//     console.error("Error fetching API token:", err);
//     throw err; // Re-throw the error to be handled by the calling function
//   }
// };

// router.get("/", async (req, res) => {
//   const page = req.query.page;
//   const direction = req.query.direction;
//   const status = req.query.status;
//   const limit = req.query.limit;
//   const sort = req.query.sort;
//   try {
//     const headers = {
//       "Content-Type": "application/json",
//       "X-Auth-Token": process.env.BG_AUTH_TOKEN,
//     };
//     const url = `https://api.bigcommerce.com/stores/${
//       process.env.STORE_HASH
//     }/v3/promotions?limit=${limit}&page=${page}&direction=${direction}${
//       status !== "all" ? `&status=${status}` : ""
//     }&sort=${sort}`;

//     const response = await axios.get(url, { headers });
//     res.send(response.data);
//   } catch (error) {
//     console.log("Error getting promotions data", error);
//   }
// });

// const getPromotion = async (id) => {
//   try {
//     const headers = {
//       "Content-Type": "application/json",
//       "X-Auth-Token": process.env.BG_AUTH_TOKEN,
//     };

//     const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v3/promotions/${id}`;

//     const response = await axios.get(url, { headers });

//     const data = {
//       name: response.data.data.name,
//       startDate: response.data.data.start_date || null,
//       endDate: response.data.data.end_date || null,
//       status: response.data.data.status,
//     };
//     await getOrdersFromTimeFrame(data.startDate, data.endDate);
//   } catch (error) {
//     console.log("Error getting promotion data", error);
//   }
// };

// const getOrdersFromTimeFrame = async (startDate, endDate) => {
//   const headers = {
//     "Content-Type": "application/json",
//     "X-Auth-Token": process.env.BG_AUTH_TOKEN,
//   };

//   const formattedStartDate = startDate ? formatISODate(startDate) : null;
//   const formattedEndDate = endDate ? formatISODate(endDate) : null;

//   let url;

//   if (formattedStartDate && formattedEndDate) {
//     url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders?min_date_created=${startDate}&max_date_created=${formattedEndDate}`;
//   }

//   if (formattedStartDate && !formattedEndDate) {
//     url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders?min_date_created=${formattedStartDate}`;
//   }

//   if (!formattedStartDate) {
//     url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders`;
//   }

//   const response = await axios.get(url + "&limit=1", { headers });

//   console.log("Orders data:", response);
// };

// getPromotion(425);

// router.get("/:id", async (req, res) => {
//   const id = req.params.id;
//   try {
//     const headers = {
//       "Content-Type": "application/json",
//       "X-Auth-Token": process.env.BG_AUTH_TOKEN,
//     };
//     const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v3/promotions/${id}`;

//     const response = await axios.get(url, { headers });

//     if (response && response.data && response.data.data) {
//       const startDate = response.data.data.start_date;
//       const endDate = response.data.data.end_date;

//       // Fetch orders within the specified time frame
//       const ordersResponse = await getOrdersFromTimeFrame(startDate, endDate);

//       console.log("Orders data:", ordersResponse);

//       res.send({
//         promoData: response.data,
//         orderData: [],
//       });
//     }
//   } catch (error) {
//     console.error(
//       "Error getting promotion data:",
//       error.response?.data || error.message
//     );
//     res.status(error.response?.status || 500).send({
//       message: "Error getting promotion data",
//       error: error.response?.data || error.message,
//     });
//   }
// });

module.exports = router;
