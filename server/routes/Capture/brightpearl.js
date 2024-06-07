require("dotenv").config();
const axios = require("axios");

const { Logtail } = require("@logtail/node");

const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

const axiosOptions = (method, resourcePath) => {
  const HEADERS = {
    "brightpearl-app-ref": process.env.BRIGHTPEARL_APP_REF,
    "brightpearl-account-token": process.env.BRIGHTPEARL_ACCOUNT_TOKEN,
  };
  return {
    method,
    url: `https://ws-use.brightpearl.com/public-api/heattransfer/${resourcePath}`,
    port: "443",
    //This is the only line that is new. `headers` is an object with the headers to request
    headers: HEADERS,
  };
};

const brightpearlAPI = (options) => {
  logtail.info(`${options.method} ${options.url}`);
  return axios({
    ...options,
  });
};

const getBCShippingInfo = async (data) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      "X-Auth-Token": process.env.BG_AUTH_TOKEN,
    };
    const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders/${data.BcId}/shipping_addresses`;

    const response = await axios.get(url, { headers });
    // Here we are getting the shipping details from the order in BigCommerce so we can get the products on the order
    const BcData = response.data[0];
    await getBCProductsOnOrder({
      BpData: data.BpData,
      BcData: BcData,
      BcId: data.BcId,
    });
  } catch (error) {
    console.log("Error getting shipping details", error);
  }
};
const getBCProductsOnOrder = async (data) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      "X-Auth-Token": process.env.BG_AUTH_TOKEN,
    };
    const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders/${data.BcId}/products`;

    const response = await axios.get(url, { headers });
    const products = [];
    // Creating our order item info for creating a shipment
    response.data.map((product) => {
      const item = {
        order_product_id: product.id,
        quantity: product.quantity,
      };
      products.push(item);
    });
    await buildBCShipmentData({
      BpData: data.BpData,
      BcData: data.BcData,
      products: products,
      id: data.BcId,
    });
  } catch (error) {
    console.log("Error getting BC Order Products", error);
  }
};

const getBPOrderNotes = async (data) => {
  const options = axiosOptions("GET", `order-service/order/${data.BpId}/note`);
  const orderNotes = await brightpearlAPI(options)
    .then((r) => r.data)
    .catch((err) => {
      console.log("Error Getting Bp Order Notes", err);
      return [];
    });
  await getBCShippingInfo({
    BpData: {
      orderNotes: orderNotes,
      orderData: data.orderData,
    },
    BcId: data.BcId,
  });
};

const getBPOrderData = async (data) => {
  const options = axiosOptions("GET", `order-service/order/${data.BpId}`);
  const orderData = await brightpearlAPI(options)
    .then((r) => r.data)
    .catch((err) => {
      console.log("Error Getting BP Order Data", err);
      return [];
    });
  // We pass the order data to getBPOrderNotes so we can get the note that contains the tracking reference from Bright Pearl
  await getBPOrderNotes({
    BpId: data.BpId,
    orderData: orderData,
    BcId: data.BcId,
  });
};

const getBPOrderId = async (id) => {
  // First we check if the order has already been shipped in BigCommerce
  const hasShipmentAlready = await checkBcOrderShipments(id);
  // We need to get the Bright Pearl Order ID from the external reference (BigCommerce Order ID)
  if (!hasShipmentAlready) {
    const options = axiosOptions(
      "GET",
      `order-service/order-search?externalRef=${id}`
    );
    const orderData = await brightpearlAPI(options)
      .then((r) => r.data.response.results[0][0])
      .catch((err) => {
        console.log("Error Getting Bp Order Id", err);
        return [];
      });
    await getBPOrderData({ BpId: orderData, BcId: id });
  }
};

const buildBCShipmentData = async (data) => {
  let trackingNote;
  // We only want the note from Bright Pearl that contains the tracking reference
  data.BpData.orderNotes.response.map((note) => {
    if (note.text.includes("Tracking Reference")) {
      trackingNote = note;
    }
  });
  if (trackingNote) {
    const trackingReferenceNumber = trackingNote.text.split(":")[1].trim();
    const trackingProviderString = trackingNote.text.split("by")[1].trim();
    const trackingProviderCode = trackingProviderString.split(" ")[0].trim();
    if (trackingReferenceNumber.toLowerCase() !== "curbside") {
      let trackingReferenceLink;
      //   Tracking link is not provided in any data so we look at the carrier and create a link based on that by inserting the tracking number into the link
      if (trackingProviderCode.toLowerCase() === "ups") {
        trackingReferenceLink = `https://www.ups.com/track?HTMLVersion=5.0&Requester=NES&AgreeToTermsAndConditions=yes&loc=en_US&tracknum=${trackingReferenceNumber}/trackdetails`;
      } else if (trackingProviderCode.toLowerCase() === "fedex") {
        trackingReferenceLink = `https://www.fedex.com/fedextrack/?trknbr=${trackingReferenceNumber}&trkqual=12027~273987946060~FDEG`;
      }
      //   This is the data structure we need to create a shipment on an Order in BigCommerce
      const shipmentData = {
        order_address_id: data.BcData.id,
        tracking_number: trackingReferenceNumber,
        tracking_link: trackingReferenceLink,
        shipping_method: data.BcData.shipping_method,
        shipping_provider: trackingProviderCode.toLowerCase(),
        tracking_carrier: trackingProviderCode,
        items: data.products,
      };
      await createBcShipmentOnOrder({
        shipmentData: shipmentData,
        id: data.id,
      });
    }
  }
};

const checkBcOrderShipments = async (data) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      "X-Auth-Token": process.env.BG_AUTH_TOKEN,
    };
    const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders/${data}/shipments`;
    const response = await axios.get(url, { headers });
    if (response.data.length > 0) {
      console.log("Order Already Shipped");
      return true;
    } else {
      console.log("Order Not Shipped");
      return false;
    }
  } catch (error) {
    console.log("Error getting BC Order Shipments", error);
  }
};

const createBcShipmentOnOrder = async (data) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      "X-Auth-Token": process.env.BG_AUTH_TOKEN,
    };
    const url = `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v2/orders/${data.id}/shipments`;

    await axios.post(url, data.shipmentData, { headers });
    console.log(`Shipping Info Created for Order ${data.id}`);
  } catch (error) {
    console.log("Error getting Creating BigCommerce Shipment", error);
  }
};

module.exports = {
  getBPOrderId,
};
