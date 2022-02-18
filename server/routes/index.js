require('dotenv').config();
const express = require('express');
const router = express.Router();

const {
    parseBrightPearlResponseIntoObjects,
    mapOrderPaymentStatusName,
    removePaidOrders,
    getOtherOrders,
    processOtherOrders,
    processUnpaidOrders
} = require('./Capture/brightpearl');

const {
    getUnpaidBrightpearlOrders,
} = require('./Capture/api');

const captureUnpaidSalesOrders = async (e) => {
    console.log('Getting sales orders...');
    const orderData = await getUnpaidBrightpearlOrders(e);
    console.log(orderData.response.results.length, 'sales orders found');

    // Bail if no orders
    if (orderData.response.results.length === 0) {
        return;
    }

    // Translate Brightpearl array-based data structure into plain objects
    // and flesh out the Payment Status data
    const orders = parseBrightPearlResponseIntoObjects(orderData).map(o => {
        return mapOrderPaymentStatusName(o, orderData.reference.orderPaymentStatusNames);
    });
    const unpaidOrders = orders.filter(removePaidOrders);
    const otherOrders = orders.filter(getOtherOrders);

    console.log(unpaidOrders.length + otherOrders.length, 'orders to capture');

    if (unpaidOrders.length === 0 && otherOrders.length === 0) {
        return;
    }

    processUnpaidOrders(unpaidOrders);
    processOtherOrders(otherOrders);
};


router.post("/", (req, res) => {

    console.log('=============');
    console.log('...running...');
    console.log(new Date().toISOString());
    console.log('=============');
    captureUnpaidSalesOrders(req.body.capture);
    // setInterval(captureUnpaidSalesOrders, 30000);

});


module.exports = router;