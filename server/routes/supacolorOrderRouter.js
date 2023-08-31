
const express = require('express');
const app = express();
const pool = require('../modules/pool');
const router = express.Router();
const axios = require("axios");

const { Logtail } = require("@logtail/node");
const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

// This router handles Supacolor products that are ordered on the Heat Transfer Store and places them in to Supacolor's system.

// Documentation can be found below ↓↓↓
// https://docs.google.com/document/d/1SkgKDUAfp26vsusmatYqTeSvUK28Zw4KQ9-7MAM_4ks/edit

// Test endpoint listening for when a product is edited
// Delete this endpoint later
router.post('/', function (req, res) {
    // Logging
    logtail.info(`Supacolor API hit via webhook: ${req.body}`);
    console.log('Product edited: ', req.body);
    res.send("it werked");
});


// This endpoint is listening for every time an order is placed
router.post('/create-order', function (req, res) {
    if (req.body.data && req.body.data.id) {
        const orderId = req.body.data.id;
        // findProductsOnOrderInBigCommerce(orderId); <--- Only turn on when you are ready to launch
        logtail.info(`Supacolor create order API hit via webhook: Order ID - ${orderId}`);
    } else {
        // Handle error - ID was not found in request
        logtail.error('Order ID was not found in request');
        res.status(400).send("Order ID was not found");
    }
});

async function findProductsOnOrderInBigCommerce(orderId) {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'X-Auth-Token': process.env.BG_AUTH_TOKEN,
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
    const supacolorProductIds = [5303, 5301, 5189, 5302, 5197, 5195, 13616, 13138, 13139, 13124, 13123, 13610];
    let foundSupacolorProducts = [];

    // Looking through products to see if any match the Supacolor product IDs
    for (const product of productArray) {
        if (supacolorProductIds.some(id => id === product.product_id)) {
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
            'Content-Type': 'application/json',
            'X-Auth-Token': process.env.BG_AUTH_TOKEN,
        };

        const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders/${orderId}`;

        const response = await axios.get(url, { headers });

        if (response.status === 200) {
            // Successfully retrieved the order details
            let orderDetails = response.data;

            // Wait for getPriceCodesFromMultipleSkus to complete
            const priceCodes = await getPriceCodesFromMultipleSkus(supacolorProducts);

            createSupacolorPayload(supacolorProducts, priceCodes, orderId, orderDetails);
            return response.data;
        } else {
            // Handle the error if the status is not 200
            logtail.error(`Error fetching order details ${orderId}: ${response.status}`);
            return null;
        }
    } catch (error) {
        // Log the error if the request fails
        logtail.error(`Failed to fetch order details ${orderId}: ${error.message}`);
        return null;
    }
}

function createSupacolorPayload(supacolorProducts, priceCodes, orderId, orderDetails) {

    let personalInfo = orderDetails.billing_address;

    const supacolorPayload = {
        orderNumber: `Order# ${orderId}`,
        orderComment: 'From Heat Transfer Warehouse',
        mustDate: false,
        description: '',
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
            postalCode: personalInfo.zip
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
                CapType: item.product_options[7].display_value_customer,
            },
            CustomerReference: `${orderId} - ${index + 1}`,
        }))
    };

    // console.log('Supacolor Payload: ', supacolorPayload);
    // sendOrderToSupacolor(supacolorPayload);
}

async function sendOrderToSupacolor(supacolorPayload) {
    console.log('sending')
    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPACOLOR_ACCESS_TOKEN}`,
        };

        const url = `https://scapi-usa.bluerocket.co.nz/Jobs`;

        // Use axios.post and include the payload in the request
        const response = await axios.post(url, supacolorPayload, { headers });

        if (response.status === 200) {
            console.log(response.data);
            return response.data;
        } else if (response.status === 400) {
            console.error('Bad Request: ', response.data);
            return null;
        } else {
            console.log(`Error placing Supacolor order ${orderId}: ${response.status}`);
            return null;
        }
    } catch (error) {
        // Log the error if the request fails
        console.log(`Failed to place Supacolor order: ${error.message}`);
        if (error.response && error.response.data) {
            console.log('Error response data: ', JSON.stringify(error.response.data, null, 2));
        }
        return null;
    }
}

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

        const cleanedSku = sku.replace('SUPAGANG-', '');
        const skuParts = cleanedSku.split('-');

        let categoryCode = skuParts[0];

        // Annoying check we have to do because the ganged 11.7x16.5 SKUs don't contain the item code.
        if (categoryCode.includes("11.7x16.5")) {
            categoryCode = categoryCode.replace("11.7x16.5", "A3")
        }

        filteredUrl = `PriceCodes/price-codes?filter=${categoryCode}`;

        const accessToken = process.env.SUPACOLOR_ACCESS_TOKEN;

        axios({
            method: 'get',
            url: `https://scapi-usa.bluerocket.co.nz/${filteredUrl}`,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                let priceCodeResults = findCorrectPriceCodeFromResults(response.data, sku);
                resolve(priceCodeResults); // Resolve the promise with the price code
            })
            .catch(error => {
                console.error('cant get price codes');
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
    const cleanedSku = skuCopy.replace('SUPAGANG-', '');
    const parts = cleanedSku.split('-');

    const categoryCode = parts[0];
    const dimensions = parts[1].toUpperCase().split('X');
    const height = parseFloat(dimensions[0]);
    const width = parseFloat(dimensions[1]);

    // We are checking the response data for these values
    const substringsToCheck = [categoryCode, height, width];
    const skuIncludesSUPAGANG = sku.includes('SUPAGANG');

    // We really ever should just get one value if everything works right.
    let correctPriceCodes = [];

    // Loop through response data. If our sku includes SUPAGANG and also satisfies
    // the above conditions, then we want to keep it. But then we want to rule out any that
    // don't have Supagang and vice versa. 
    for (const result of results) {
        const priceCodeIncludesSUPAGANG = result.priceCode.includes('SUPAGANG');
        if ((skuIncludesSUPAGANG === priceCodeIncludesSUPAGANG) &&
            substringsToCheck.every(substring => result.priceCode.includes(substring))) {
            correctPriceCodes.push(result.priceCode);
        }
    }

    console.log("Correct price code is: ", correctPriceCodes[0])

    return correctPriceCodes[0];
}



// Testing stuff below --- delete later

// getPriceCodeWithSku("WE_SUPAGANG-11.7x16.5-2");
// findProductsOnOrderInBigCommerce(3465561);
// let multipleSkus = ["WE_SUPAGANG-11.7x16.5-2", "WE_SQ-11.7x11.7-7", "WE_A5-5.8X8.3-3"];
// getPriceCodesFromMultipleSkus(multipleSkus);

module.exports = router;