require('dotenv').config();
const express = require('express');
const router = express.Router();

const { Logtail } = require("@logtail/node");

const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

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
    logtail.info('Getting sales orders...');
    const orderData = await getUnpaidBrightpearlOrders(e);
    logtail.info(orderData.response.results.length, 'sales orders found');

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

    logtail.info(unpaidOrders.length + otherOrders.length, 'orders to capture');

    if (unpaidOrders.length === 0 && otherOrders.length === 0) {
        return;
    }

    processUnpaidOrders(unpaidOrders);
    processOtherOrders(otherOrders);
};


router.post("/", (req, res) => {

    logtail.info('=============');
    logtail.info('...running...');
    logtail.info(new Date().toISOString());
    logtail.info('=============');
    captureUnpaidSalesOrders(req.body.capture);
    // setInterval(captureUnpaidSalesOrders, 30000);

});


module.exports = router;