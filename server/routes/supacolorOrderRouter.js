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

// Test endpoint listening for when a product is edited
// Delete this endpoint later
// router.post("/", function (req, res) {
//   // Logging
//   logtail.info(`Supacolor API hit via webhook: ${req.body}`);
//   console.log("Product edited: ", req.body);
//   res.send("it werked");
// });

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

async function findProductsOnOrderInBigCommerce(orderId) {
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
      // console.log(response.data);
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
  const supacolorProductIds = [
    5303, 5301, 5189, 5302, 5197, 5195, 13616, 13138, 13139, 13124, 13123,
    13610,
  ];
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
      },
      CustomerReference: `${orderId}: ${index + 1}`,
    })),
  };

  console.log("Supacolor Payload: ", supacolorPayload);
  sendOrderToSupacolor(supacolorPayload);
}

// let mockSupacolorPayload = {
//   orderNumber: "Order# 3453455",
//   orderComment: "Some comment",
//   mustDate: false,
//   description: "some job description",
//   deliveryAddress: {
//     deliveryMethod: "Next Day Air",
//     Organization: "Print Transfers r us",
//     contactName: "Jeremy Fictious",
//     phone: "+83475837458",
//     emailAddress: "fictious@gmail.com",
//     countryCodeIso2: "US",
//     streetAddress: "3300 Bear Hollow road",
//     address2: "",
//     //"suburb": "",
//     city: "Wilson",
//     state: "OK",
//     postalCode: "73463-6299",
//   },
//   items: [
//     {
//       itemType: "Asset",
//       code: "BL10035",
//       quantity: 20,
//       garment: "Black Tees",
//       comment: "As previous",
//       CustomerReference: "3453455: 1",
//     },
//     {
//       itemType: "PriceCode",
//       code: 'B1_A3:Blocker 1 Color - Single Image-A3 11.7" x 16.5"',
//       quantity: 20,
//       attributes: {
//         description: "Summer Holiday",
//         garment: "Polyester",
//         colors: "As Art",
//         size: "5.8w x 16.0h",
//       },
//       CustomerReference: "3453455: 2",
//     },
//     {
//       itemType: "PriceCode",
//       code: 'H1_CAP_SM:Headwear 1 Colour-2.5" x 2.5"',
//       quantity: 10,
//       attributes: {
//         description: "Blocker Transfer",
//         garment: "Polyester",
//         colors: "As Art",
//         size: "5.8w x 16.0h",
//         "Cap Type": "Seam",
//       },
//       CustomerReference: "3453455: 3",
//     },
//     {
//       itemType: "PriceCode",
//       code: 'H1_CAP_SM:Headwear 1 Colour-2.5" x 2.5"',
//       quantity: 10,
//       attributes: {
//         description: "Blocker Transfer",
//         garment: "Polyester",
//         colors: "As Art",
//         size: "5.8w x 16.0h",
//         "Cap Type": "Seam",
//       },
//       CustomerReference: "3453455: 4",
//     },
//     {
//       itemType: "PriceCode",
//       code: 'H1_CAP_SM:Headwear 1 Colour-2.5" x 2.5"',
//       quantity: 10,
//       attributes: {
//         description: "Blocker Transfer",
//         garment: "Polyester",
//         colors: "As Art",
//         size: "5.8w x 16.0h",
//         "Cap Type": "Seam",
//       },
//       CustomerReference: "3453455: 5",
//     },
//     {
//       itemType: "PriceCode",
//       code: 'H1_CAP_SM:Headwear 1 Colour-2.5" x 2.5"',
//       quantity: 10,
//       attributes: {
//         description: "Blocker Transfer",
//         garment: "Polyester",
//         colors: "As Art",
//         size: "5.8w x 16.0h",
//         "Cap Type": "Seam",
//       },
//       CustomerReference: "3453455: 6",
//     },
//   ],
// };

// sendOrderToSupacolor(mockSupacolorPayload);

// This is our function that will end up sending our order details to supacolor to create the job s

/* We will also take the response of this job information and store it in our Digital Ocean database as a copy on the frontend for our Admin App which is where we will be uploading the artwork for a given order*/

async function sendOrderToSupacolor(supacolorPayload) {
  console.log("sending");
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SUPACOLOR_ACCESS_TOKEN}`,
    };

    const url = `https://scapi-usa.bluerocket.co.nz/Jobs`;

    // Use axios.post and include the payload in the request
    const response = await axios.post(url, supacolorPayload, { headers });

    if (response.status === 200) {
      //   console.log(response.data);
      const supacolourJob = {
        jobNumber: response.data.jobNumber,
        dateDue: response.data.dateDue,
        jobLineDetails: response.data.jobLineDetails.map((detail) => ({
          newAssetSku: detail.newAssetSku || " ",
          needsArtworkToBeUploaded: detail.needsArtworkToBeUploaded,
          customerReference: detail.customerReference,
          quantity: detail.quantity,
        })),
        totalJobCost: response.data.totalJobCost,
        expectingArtworkToBeUploaded:
          response.data.expectingArtworkToBeUploaded,
      };
      console.log(supacolourJob);
      await axios.post(
        "http://localhost:3000/supacolor-api/new-job",
        supacolourJob
      );
      // await axios.post(
      //   "https://admin.heattransferwarehouse.com/supacolor-api/new-job",
      //   supacolourJob
      // );

      return response.data;
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

// This is our function to send the artwork to supacolor through their api and make a copy of the response and put it into our Digital Ocean Database

router.post("/upload-artwork/:jobId", upload.any(), async (req, res) => {
  try {
    const { jobId } = req.params;
    const formData = new FormData();

    Object.keys(req.body).forEach((key) => {
      formData.append(key, req.body[key]);
    });

    // If you have files:
    req.files.forEach((file) => {
      formData.append(file.fieldname, file.buffer, file.originalname);
    });

    const response = await axios.post(
      `https://scapi-usa.bluerocket.co.nz/Jobs/${jobId}/artwork`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.SUPACOLOR_ACCESS_TOKEN}`,
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
        `http://localhost:3000/supacolor-api/artwork`,
        uploadedArtwork
      );
      // await axios.post(
      //   `https://admin.heattransferwarehouse.com/supacolor-api/artwork`,
      //   uploadedArtwork
      // );
      await axios.put(
        `http://localhost:3000/supacolor-api/update-needs-artwork/${jobId}`
      );
      // await axios.put(
      //   `https://admin.heattransferwarehouse.com/supacolor-api/update-needs-artwork/${jobId}`
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
    UPDATE "job_line_details"
    SET "needs_artwork" = false
    WHERE "job_line_details".job_id = $1;
    `;
  pool
    .query(query, [jobId])
    .then(() => res.sendStatus(200))
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
        INSERT INTO "supacolor_jobs" ("job_id", "date_due", "job_cost", "expecting_artwork")
        VALUES ($1, $2, $3, $4);
        `;

  try {
    await client.query("BEGIN;");
    await client.query(text1, [
      supacolorJob.jobNumber,
      supacolorJob.dateDue,
      supacolorJob.totalJobCost,
      supacolorJob.expectingArtworkToBeUploaded,
    ]);

    for (let detail of supacolorJob.jobLineDetails) {
      await client.query(
        `
          INSERT INTO "job_line_details" ("job_id", "new_asset_sku", "needs_artwork", "customer_reference", "quantity")
          VALUES ($1, $2, $3, $4, $5);
          `,
        [
          supacolorJob.jobNumber,
          detail.newAssetSku,
          detail.needsArtworkToBeUploaded,
          detail.customerReference,
          detail.quantity,
        ]
      );
    }

    await client.query("COMMIT;");

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
  try {
    const client = await pool.connect();
    const query = `
            SELECT 
                "supacolor_jobs".*,
                json_agg(
                    json_build_object(
                        'id', "job_line_details".id,
                        'new_asset_sku', "job_line_details".new_asset_sku,
                        'needs_artwork', "job_line_details".needs_artwork,
                        'customer_reference', "job_line_details".customer_reference,
                        'quantity', "job_line_details".quantity
                    )
                ) AS "job_line_details"
            FROM 
                "supacolor_jobs"
            LEFT JOIN 
                "job_line_details" ON "supacolor_jobs".job_id = "job_line_details".job_id
            GROUP BY 
                "supacolor_jobs".id, "supacolor_jobs".job_id, "supacolor_jobs".date_due, "supacolor_jobs".job_cost, "supacolor_jobs".expecting_artwork
        `;

    const result = await client.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching data", err.stack);
    res.status(500).send("Internal Server Error");
  }
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

    const accessToken = process.env.SUPACOLOR_ACCESS_TOKEN;

    axios({
      method: "get",
      url: `https://scapi-usa.bluerocket.co.nz/${filteredUrl}`,
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

// Testing stuff below --- delete later

// getPriceCodeWithSku("WE_SUPAGANG-11.7x16.5-2");
// findProductsOnOrderInBigCommerce(3465561);
// let multipleSkus = [
//   "WE_SUPAGANG-11.7x16.5-2",
//   "WE_SQ-11.7x11.7-7",
//   "WE_A5-5.8X8.3-3",
// ];
// getPriceCodesFromMultipleSkus(multipleSkus);

module.exports = router;
