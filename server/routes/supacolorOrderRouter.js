const express = require("express");

const app = express();
const pool = require("../modules/pool");
const router = express.Router();
const axios = require("axios");
const FormData = require("form-data");
const multer = require("multer");
const upload = multer();

const { Logtail } = require("@logtail/node");
const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

// This router handles Supacolor products that are ordered on the Heat Transfer Store and places them in to Supacolor's system.

// Documentation can be found below ↓↓↓
// https://docs.google.com/document/d/1SkgKDUAfp26vsusmatYqTeSvUK28Zw4KQ9-7MAM_4ks/edit

let accessToken;

async function getAccessToken() {
  try {
    const data = new URLSearchParams();
    data.append("client_id", process.env.CLIENT_ID);
    data.append("client_secret", process.env.CLIENT_SECRET);
    data.append("username", process.env.USER_NAME);
    data.append("password", process.env.USER_PASSWORD);
    data.append("grant_type", "password");
    const url = `https://${process.env.AUTH_URL}/realms/${process.env.REALM}/protocol/openid-connect/token`;
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    const response = await axios.post(url, data, { headers });

    if (response.status === 200) {
      return response.data.access_token;
    }
  } catch (error) {
    console.log("Error getting Auth", error);
  }
}

async function storeToken() {
  try {
    accessToken = await getAccessToken();
  } catch (err) {
    console.log("Error obtaining access token", err);
  }
}

// This endpoint is listening for every time an order is placed
router.post("/create-order", function (req, res) {
  if (req.body.data && req.body.data.id) {
    const orderId = req.body.data.id;
    findProductsOnOrderInBigCommerce(orderId);
    logtail.info(
      `Supacolor create order API hit via webhook: Order ID - ${orderId}`
    );
  } else {
    // Handle error - ID was not found in request
    logtail.error("Order ID was not found in request");
    res.status(400).send("Order ID was not found");
  }
});

// Our function to find the order in big commerce orders webhook with the order id we received
async function findProductsOnOrderInBigCommerce(orderId) {
  storeToken();
  try {
    const headers = {
      "Content-Type": "application/json",
      "X-Auth-Token": process.env.BG_AUTH_TOKEN,
    };

    const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders/${orderId}/products`;

    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      // Successfully retrieved the order
      findSupacolorProductsOnOrder(response.data);

      return response.data;
    } else {
      // Handle the error if the status is not 200
      logtail.error(`Error fetching order ${orderId}: ${response.status}`);
      return null;
    }
  } catch (error) {
    // Log the error if the request fails
    logtail.error(`Failed to fetch order ${orderId}: ${error.message}`);
    return null;
  }
}

function findSupacolorProductsOnOrder(productArray) {
  const supacolorProductIds = [5303, 5301, 5189, 5302, 5197, 5195, 13616];
  let foundSupacolorProducts = [];

  // Looking through products to see if any match the Supacolor product IDs
  for (const product of productArray) {
    if (supacolorProductIds.some((id) => id === product.product_id)) {
      foundSupacolorProducts.push(product);
    }
  }

  // If any Supacolor products are found, begin to send them, else we will do nothing.
  if (foundSupacolorProducts.length > 0) {
    // Since we found Supacolor product, we first need to get more information about the order before we
    // can begin to send to Supacolor. Need to pass along found products.
    getOrderDetails(foundSupacolorProducts, foundSupacolorProducts[0].order_id);
  }
}

// Retrieving order details (i.e. address, name). We only run this if we find Supacolor product(s) on the order.
async function getOrderDetails(supacolorProducts, orderId) {
  try {
    const headers = {
      "Content-Type": "application/json",
      "X-Auth-Token": process.env.BG_AUTH_TOKEN,
    };

    const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders/${orderId}`;

    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      // Successfully retrieved the order details
      let orderDetails = response.data;

      // Wait for getPriceCodesFromMultipleSkus to complete
      const priceCodes = await getPriceCodesFromMultipleSkus(supacolorProducts);

      createSupacolorPayload(
        supacolorProducts,
        priceCodes,
        orderId,
        orderDetails
      );
      return response.data;
    } else {
      // Handle the error if the status is not 200
      logtail.error(
        `Error fetching order details ${orderId}: ${response.status}`
      );
      return null;
    }
  } catch (error) {
    // Log the error if the request fails
    logtail.error(`Failed to fetch order details ${orderId}: ${error.message}`);
    return null;
  }
}

function createSupacolorPayload(
  supacolorProducts,
  priceCodes,
  orderId,
  orderDetails
) {
  let personalInfo = orderDetails.billing_address;

  const supacolorPayload = {
    orderNumber: `Order# ${orderId}`,
    orderComment: "From Heat Transfer Warehouse",
    mustDate: false,
    description: "",
    deliveryAddress: {
      deliveryMethod: "Next Day Air",
      Organisation: personalInfo.company,
      contactName: `${personalInfo.first_name} ${personalInfo.last_name}`,
      phone: personalInfo.phone,
      emailAddress: personalInfo.email,
      countryCodeIso2: personalInfo.country_iso2,
      streetAddress: personalInfo.street_1,
      address2: personalInfo.street_2,
      city: personalInfo.city,
      state: personalInfo.state,
      postalCode: personalInfo.zip,
    },
    items: supacolorProducts.map((item, index) => ({
      itemType: "PriceCode",
      code: priceCodes[index],
      quantity: item.quantity,
      attributes: {
        description: "",
        garment: item.product_options[4].display_value_customer,
        colors: "CMYK",
        size: item.product_options[5].display_value_customer,
        ...(priceCodes[index].includes("Headwear")
          ? { "Cap Type": item.product_options[7].display_value_customer }
          : {}),
      },
      CustomerReference: `${orderId}: ${index + 1}`,
    })),
  };
  if (
    orderDetails.custom_status === "Cancelled" ||
    orderDetails.custom_status === "Refunded" ||
    orderDetails.custom_status === "Awaiting Fulfillment" ||
    orderDetails.custom_status === "Shipped" ||
    orderDetails.custom_status === "Declined" ||
    orderDetails.custom_status === "Awaiting Payment" ||
    orderDetails.custom_status === "Completed" ||
    orderDetails.custom_status === "Partially Refunded"
  ) {
    return null;
  } else {
    sendOrderToSupacolor(supacolorPayload, supacolorProducts);
  }
}

/* We will also take the response of this job information and store it in our Digital Ocean database as a copy on the frontend for our Admin App which is where we will be uploading the artwork for a given order*/

async function sendOrderToSupacolor(supacolorPayload, supacolorProducts) {
  //
  const orderId = supacolorPayload.orderNumber.split("# ")[1];

  const isOrderIdInDatabase = await checkorderIdInDatabase(Number(orderId));

  if (isOrderIdInDatabase) {
    console.log(`Order Id ${orderId} is already in DB`);
    return null;
  } else {
    console.log("Sending Order to Supacolor");
    if (!accessToken) {
      console.log("Failed to get access token");
    }
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      const url = `https://${process.env.BASE_URL}/Jobs`;

      // Use axios.post and include the payload in the request
      const response = await axios.post(url, supacolorPayload, { headers });

      if (response.status === 200) {
        console.log("Job Successfully Created");
        const supacolourJob = {
          jobNumber: response.data.jobNumber,
          orderId: supacolorPayload.orderNumber.split("# ")[1],
          dateDue: response.data.dateDue,
          contactName: supacolorPayload.deliveryAddress.contactName,
          jobLineDetails: response.data.jobLineDetails.map((detail, index) => {
            const skus = supacolorProducts.map((prod) => prod.sku);

            return {
              customerReference: detail.customerReference,
              needsArtworkToBeUploaded: detail.needsArtworkToBeUploaded,
              quantity: detail.quantity,
              needsArtworkToBeUploaded: detail.needsArtworkToBeUploaded,
              itemSku: skus[index], // This will be an array of SKUs
            };
          }),

          totalJobCost: response.data.totalJobCost,
          expectingArtworkToBeUploaded:
            response.data.expectingArtworkToBeUploaded,
        };
        await axios.post(
          "https://admin.heattransferwarehouse.com/supacolor-api/new-job",
          supacolourJob
        );
        // await axios.post(
        //   "http://localhost:3000/supacolor-api/new-job",
        //   supacolourJob
        // );

        // return response.data;
      } else if (response.status === 400) {
        console.error("Bad Request: ", response.data);
        return null;
      } else {
        console.log(
          `Error placing Supacolor order ${orderId}: ${response.status}`
        );
        return null;
      }
    } catch (error) {
      // Log the error if the request fails
      console.log(`Failed to place Supacolor order: ${error.message}`);
      if (error.response && error.response.data) {
        console.log(
          "Error response data: ",
          JSON.stringify(error.response.data, null, 2)
        );
      }
      return null;
    }
  }
}
// To eliminate duplicate supacolor orders being create, we have a function to check if the order is in our db already
async function checkorderIdInDatabase(orderId) {
  try {
    const queryText =
      'SELECT COUNT(*) as count FROM "supacolor_jobs" WHERE "order_id" = $1;';
    const result = await pool.query(queryText, [orderId]);

    // If the count is > 0, the order ID exists in the database
    return result.rows[0].count > 0;
  } catch (error) {
    console.error("Error querying the database:", error);
    throw error;
  }
}

// This is our function to send the artwork to supacolor through their api and make a copy of the response and put it into our Digital Ocean Database

router.post("/upload-artwork/:jobId", upload.any(), async (req, res) => {
  // Get and store our token to upload artwork whenever this post is called
  storeToken();
  try {
    // Create our form data and jobId variables
    const { jobId } = req.params;
    const formData = new FormData();

    // Append our form data into the form data var
    Object.keys(req.body).forEach((key) => {
      formData.append(key, req.body[key]);
    });

    // If you have files:
    req.files.forEach((file) => {
      formData.append(file.fieldname, file.buffer, file.originalname);
    });

    // If we don't have an access token log and error
    if (!accessToken) {
      console.log("Failed to get access token");
    }

    // Our post to the create job end point with the job id and form data holding our artwork files
    const response = await axios.post(
      `https://${process.env.BASE_URL}/Jobs/${jobId}/artwork`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log("Artwork Upload Response", response.data);
    if (response.status === 200) {
      const uploadedArtwork = {
        jobId: jobId,
        allRequiredJobArtworkUploaded:
          response.data.allRequiredJobArtworkUploaded,
        uploads: response.data.uploads.map((upload) => ({
          customerReference: upload.customerReference,
          message: upload.message,
          uploadSuccessful: upload.uploadSuccessful,
        })),
        allUploadsSuccessful: response.data.allUploadsSuccessful,
      };
      await axios.post(
        `https://admin.heattransferwarehouse.com/supacolor-api/artwork`,
        uploadedArtwork
      );
      // await axios.post(
      //   `http://localhost:3000/supacolor-api/artwork`,
      //   uploadedArtwork
      // );
      if (response.data.allRequiredJobArtworkUploaded)
        await axios.put(
          `https://admin.heattransferwarehouse.com/supacolor-api/update-needs-artwork/${jobId}`
        );
      // await axios.put(
      //   `http://localhost:3000/supacolor-api/update-needs-artwork/${jobId}`
      // );
    } else {
      console.log(
        `Error placing Supacolor order ${orderId}: ${response.status}`
      );
      return null;
    }
    res.sendStatus(200);
  } catch (error) {
    console.error("Error uploading to external API:", error);
    res.status(500).send(error.message);
  }
});

/* Once we upload the artwork to supacolor we want to indicate that on the frontend by changing the boolean values for our copy of the job which will have an "needs_artwork" column which is what we are updating with this route */

router.put("/update-needs-artwork/:id", async (req, res) => {
  const jobId = req.params.id;
  const query = `
    UPDATE "supacolor_jobs"
    SET "expecting_artwork" = false, "active" = false, "complete" = true
    WHERE "supacolor_jobs".job_id = $1;
    `;
  pool
    .query(query, [jobId])
    .then((results) => res.send(results.rows))
    .catch((err) => {
      console.log("Error Updating Artwork Needed", err);
      res.sendStatus(500);
    });
});

/* This is our post to our Digital Ocean database where were are copying the response from sending the artwork into our DB so we can see the details on the frontend */

router.post("/artwork", async (req, res) => {
  const uploadedArtwork = req.body;
  console.log("Posting Artwork Upload to DB");
  const client = await pool.connect();

  try {
    await client.query("BEGIN;");

    const insertResponse = `
    INSERT INTO "artwork_upload_response"("job_id", "all_artwork_uploaded", "all_uploads_successful")
    VALUES ($1, $2, $3) 
      `;

    // Insert into the artwork_upload_response and get the returned id
    await client.query(insertResponse, [
      uploadedArtwork.jobId,
      uploadedArtwork.allRequiredJobArtworkUploaded,
      uploadedArtwork.allUploadsSuccessful,
    ]);

    for (let upload of uploadedArtwork.uploads) {
      await client.query(
        `INSERT INTO "artwork_uploads" 
            ("customer_reference", "upload_successful", "message", "job_id")
            VALUES 
            ($1, $2, $3, $4);`,
        [
          upload.customerReference,
          upload.uploadSuccessful,
          upload.message,
          uploadedArtwork.jobId,
        ]
      );
    }

    await client.query("COMMIT;");
    res.sendStatus(200);
  } catch (error) {
    await client.query("ROLLBACK;");
    console.log(error);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});

/* This is our route to create a copy of the response we get from creating a job with supacolors api so we have it on the frontend where we will then upload the artwork */

router.post("/new-job", async (req, res) => {
  const supacolorJob = req.body;
  console.log("Posting Job to DB");
  const client = await pool.connect();
  const text1 = `
        INSERT INTO "supacolor_jobs" ("job_id", "order_id", "date_due", "job_cost", "expecting_artwork", "customer_name")
        VALUES ($1, $2, $3, $4, $5, $6);
        `;

  try {
    await client.query("BEGIN;");
    await client.query(text1, [
      supacolorJob.jobNumber,
      supacolorJob.orderId,
      supacolorJob.dateDue,
      supacolorJob.totalJobCost,
      supacolorJob.expectingArtworkToBeUploaded,
      supacolorJob.contactName,
    ]);

    for (let detail of supacolorJob.jobLineDetails) {
      await client.query(
        `
          INSERT INTO "job_line_details" ("job_id", "customer_reference", "quantity", "item_sku", "needs_artwork")
          VALUES ($1, $2, $3, $4, $5);
          `,
        [
          supacolorJob.jobNumber,
          detail.customerReference,
          detail.quantity,
          detail.itemSku,
          detail.needsArtworkToBeUploaded,
        ]
      );
    }

    await client.query("COMMIT;");

    console.log("Job Successfully Made in DB");
    res.sendStatus(200);
  } catch (err) {
    await client.query("ROLLBACK;");
    console.log(err);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});

/* This is our route to get a specific jobs details to be able to look at on the frontend. This is coming from our Digital Ocean DB */

router.get("/get-job-details/:id", async (req, res) => {
  const query = `
        SELECT 
    "artwork_upload_response".*,
    json_agg(
        json_build_object(
            'upload_successful', "artwork_uploads".upload_successful,
            'customer_reference', "artwork_uploads".customer_reference,
            'message', "artwork_uploads".message
        )
    ) AS "artwork_uploads"
FROM 
    "artwork_upload_response"
LEFT JOIN 
    "artwork_uploads" ON "artwork_upload_response".job_id = "artwork_uploads".job_id
WHERE
    "artwork_upload_response".job_id = $1
GROUP BY 
    "artwork_upload_response".id, 
    "artwork_upload_response".job_id, 
    "artwork_upload_response".all_artwork_uploaded, 
    "artwork_upload_response".all_uploads_successful;
        `;
  pool
    .query(query, [req.params.id])
    .then((results) => res.send(results.rows))
    .catch((error) => {
      res.sendStatus(500);
      console.log("Error Getting Job Detail", error);
    });
});

/* This get is fetching our jobs that we put into the Digital Ocean DB to list on the frontend in the admin app */

router.get("/get-jobs", async (req, res) => {
  const query = `
  SELECT 
  "supacolor_jobs".*,
  json_agg(
      json_build_object(
          'id', "job_line_details".id,
          'customer_reference', "job_line_details".customer_reference,
          'quantity', "job_line_details".quantity,
          'item_sku', "job_line_details".item_sku,
          'needs_artwork', "job_line_details".needs_artwork
      )
  ) AS "job_line_details"
FROM 
  "supacolor_jobs"
LEFT JOIN 
  "job_line_details" ON "supacolor_jobs".job_id = "job_line_details".job_id
WHERE
  "supacolor_jobs"."perm_delete" = false
GROUP BY 
  "supacolor_jobs".id, "supacolor_jobs".job_id, "supacolor_jobs".date_due, "supacolor_jobs".job_cost, "supacolor_jobs".expecting_artwork
;
        `;

  pool
    .query(query)
    .then((results) => res.send(results.rows))
    .catch((error) => console.log("Error Getting Jobs", err));
});

router.put("/mark-job-canceled/:id", async (req, res) => {
  const jobId = req.params.id;

  const query = `UPDATE "supacolor_jobs" SET "canceled" = true, "fake_delete" = false, "active" = false, "complete" = false WHERE "supacolor_jobs".job_id = $1`;

  pool
    .query(query, [jobId])
    .then((results) => res.send(results.rows))
    .catch((error) => {
      console.log("Error Marking Job Canceled", error);
      res.status(500).send("Internal server error");
    });
});

router.put("/mark-job-active/:id", async (req, res) => {
  const jobId = req.params.id;
  const query = `UPDATE "supacolor_jobs" SET "active" = true, "canceled" = false, "fake_delete" = false, "complete" = false WHERE "supacolor_jobs".job_id = $1`;
  pool
    .query(query, [jobId])
    .then((results) => res.send(results.rows))
    .catch((error) => {
      console.log("Error Marking Job Canceled", error);
      res.status(500).send("Internal server error");
    });
});

router.put("/mark-job-deleted/:id", async (req, res) => {
  const jobId = req.params.id;
  const query = `UPDATE "supacolor_jobs" SET "perm_delete" = true, "canceled" = false, "fake_delete" = false, "active" = false, "complete" = false WHERE "supacolor_jobs".job_id = $1`;
  pool
    .query(query, [jobId])
    .then((results) => res.send(results.rows))
    .catch((error) => {
      console.log("Error Marking Job Canceled", error);
      res.status(500).send("Internal server error");
    });
});
router.put("/mark-job-complete/:id", async (req, res) => {
  const jobId = req.params.id;
  const query = `UPDATE "supacolor_jobs" SET "complete" = true, "canceled" = false, "fake_delete" = false, "active" = false WHERE "supacolor_jobs".job_id = $1`;
  pool
    .query(query, [jobId])
    .then((results) => res.send(results.rows))
    .catch((error) => {
      console.log("Error Marking Job Canceled", error);
      res.status(500).send("Internal server error");
    });
});

router.put("/mark-job-archived/:id", async (req, res) => {
  const jobId = req.params.id;
  const query = `UPDATE "supacolor_jobs" SET "fake_delete" = true, "canceled" = false, "active" = false, "complete" = false WHERE "supacolor_jobs".job_id = $1`;
  pool
    .query(query, [jobId])
    .then((results) => res.send(results.rows))
    .catch((error) => {
      console.log("Error Marking Job Canceled", error);
      res.status(500).send("Internal server error");
    });
});

async function getPriceCodesFromMultipleSkus(supacolorProducts) {
  let skus = [];

  // Getting just the SKUs from Supacolor products
  for (product of supacolorProducts) {
    skus.push(product.sku);
  }

  let priceCodes = [];

  // Getting price code from SKU
  for (const sku of skus) {
    let priceCode = await getPriceCodeWithSku(sku);
    priceCodes.push(priceCode);
  }

  return priceCodes;
}

// Because we need a priceCode to start the order for Supacolor and all of our SKUs are different than Supacolor's priceCodes
// it will be easiest to just make another API call to Supacolor to find the priceCode that is a closest match to our SKU.
// This is much easier and should be more future-proof than doing some sort of massive translation function.

async function getPriceCodeWithSku(sku) {
  return new Promise((resolve, reject) => {
    let filteredUrl = "";

    const cleanedSku = sku.replace("SUPAGANG-", "");
    const skuParts = cleanedSku.split("-");

    let categoryCode = skuParts[0];

    // Annoying check we have to do because the ganged 11.7x16.5 SKUs don't contain the item code.
    if (categoryCode.includes("11.7x16.5")) {
      categoryCode = categoryCode.replace("11.7x16.5", "A3");
    }

    filteredUrl = `PriceCodes/price-codes?filter=${categoryCode}`;

    axios({
      method: "get",
      url: `https://${process.env.BASE_URL}/${filteredUrl}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        let priceCodeResults = findCorrectPriceCodeFromResults(
          response.data,
          sku
        );
        resolve(priceCodeResults); // Resolve the promise with the price code
      })
      .catch((error) => {
        console.error("cant get price codes");
        reject(error); // Reject the promise in case of an error
      });
  });
}

function findCorrectPriceCodeFromResults(results, sku) {
  let skuCopy = sku;

  // Checker for inconsistent SKUs. The largest SUPAGANG sheet does not contain the A3 code
  // which messes up the rest of the system.
  if (sku.includes("11.7x16.5") && !sku.includes("A3")) {
    skuCopy = skuCopy.replace(/(^[^-]*-)/, "$1A3-");
  }

  // Removing Supagang to make SKU consistent
  const cleanedSku = skuCopy.replace("SUPAGANG-", "");
  const parts = cleanedSku.split("-");

  const categoryCode = parts[0];
  const dimensions = parts[1].toUpperCase().split("X");
  const height = parseFloat(dimensions[0]);
  const width = parseFloat(dimensions[1]);

  // We are checking the response data for these values
  const substringsToCheck = [categoryCode, height, width];
  const skuIncludesSUPAGANG = sku.includes("SUPAGANG");

  // We really ever should just get one value if everything works right.
  let correctPriceCodes = [];

  // Loop through response data. If our sku includes SUPAGANG and also satisfies
  // the above conditions, then we want to keep it. But then we want to rule out any that
  // don't have Supagang and vice versa.
  for (const result of results) {
    const priceCodeIncludesSUPAGANG = result.priceCode.includes("SUPAGANG");
    if (
      skuIncludesSUPAGANG === priceCodeIncludesSUPAGANG &&
      substringsToCheck.every((substring) =>
        result.priceCode.includes(substring)
      )
    ) {
      correctPriceCodes.push(result.priceCode);
    }
  }

  console.log("Correct price code is: ", correctPriceCodes[0]);

  return correctPriceCodes[0];
}

module.exports = router;
