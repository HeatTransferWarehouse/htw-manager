const {
    sendCustomerPaymentToBrightPearl,
    getOrderData,
    getOrderCustomerPayment
} = require('./api');

const { Logtail } = require("@logtail/node");

const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

const PAYMENT_TYPES = {
    auth: 'AUTH',
    capture: 'CAPTURE',
    receipt: 'RECEIPT'
}

const createCustomerPaymentRecord = (authPayment) => {
    const {
        amountAuthorized,
        currencyCode,
        orderId,
        paymentMethodCode,
        transactionCode,
        paymentDate,
    } = authPayment;

    // payload to be sent back to Brightpearl
    return {
        amountPaid: amountAuthorized,
        currencyIsoCode: currencyCode,
        orderId,
        paymentDate,
        paymentMethodCode,
        paymentType: PAYMENT_TYPES.capture,
        transactionCode,
        amountAuthorized,
    };
};

const createCustomerPaymentRecordFromOrder = (order) => {
    const data = {
        amountAuthorized: order.totalValue.total,
        currencyCode: order.currency.orderCurrencyCode,
        orderId: order.id,
        paymentMethodCode: 1060,
        transactionCode: null,
        paymentDate: order.placedOn,
    };
    // payload to be sent back to Brightpearl
    return createCustomerPaymentRecord(data);
};

const getCapturedPayment = paymentList => {
    return paymentList.reduce((acc, cp) => {
        const capturedOrReceipt = cp.paymentType === PAYMENT_TYPES.capture || cp.paymentType === PAYMENT_TYPES.receipt
        if (!acc && capturedOrReceipt) {
            acc = cp;
        }
        return acc;
    }, null);
}

const getAuthPayment = paymentList => {
    return paymentList.reduce((acc, cp) => {
        if (!acc && cp.paymentType === PAYMENT_TYPES.auth) {
            acc = cp;
        }
        return acc;
    }, null);
}

const parseBrightPearlResponseIntoObjects = json => {
    const { response } = json;
    if (!response) {
        return false;
    }
    const {
        results,
        metaData
    } = response;

    if (metaData.resultsReturned === 0) {
        return [];
    }

    return results.map(resultsArray => {
        const resultsObject = {};
        resultsArray.forEach((resultValue, i) => {
            const column = metaData.columns[i];
            resultsObject[column.name] = resultValue;
        });
        return resultsObject
    });
};

const captureBrightpearlOrderPayment = async customerPaymentResults => {
    const capturedPayment = getCapturedPayment(customerPaymentResults);
    if (capturedPayment) {
        logtail.info('order already CAPTURED');
        return 0;
    }

    const authPayment = getAuthPayment(customerPaymentResults);
    if (authPayment) {
        // create Customer Payment payload
        const customerPaymentRecord = createCustomerPaymentRecord(authPayment);
        // logtail.info('customerPaymentRecord', customerPaymentRecord);
        // send payload to Brightpearl
        const customerPaymentPOSTResult = await sendCustomerPaymentToBrightPearl(customerPaymentRecord).then(r => r);
        if (customerPaymentPOSTResult) {
            return 1;
        }
    }
    return 0;
}; 

const removePaidOrders = order => order.orderPaymentStatusName !== 'PAID';

const getOtherOrders = order => order.orderPaymentStatusName === 'NOT_APPLICABLE' || order.orderPaymentStatusName === 'UNPAID';

const mapOrderPaymentStatusName = (order, orderPaymentStatusNamesMap) => {
    const orderPaymentStatusName = orderPaymentStatusNamesMap[order.orderPaymentStatusId.toString()];
    logtail.info(order.orderId, order.orderPaymentStatusId, orderPaymentStatusName);
    return {
        ...order,
        orderPaymentStatusName,
    }
}

const processUnpaidOrders = async unpaidOrders => {
    // Query Brightpearl and get the Customer Payment records for each order
    const orderCustomerPayments = Promise.all(unpaidOrders.map(o => {
        logtail.info(o.orderId.toString());
        return getOrderCustomerPayment(o);
    }))
    .catch(err => {
        logtail.info(err.message);
        return err
    });
    // Capture the order payment by building a new Customer Payment record and POSTing it back to Brightpearl
    orderCustomerPayments.then(customerPayments => {
        return Promise.all(customerPayments.map(parseBrightPearlResponseIntoObjects).map(cp => {
            return captureBrightpearlOrderPayment(cp);
        }));
    })
    .catch(err => {
        logtail.info(err.message);
        return err
    });
};

const processOtherOrders = async orders => {
    orders.forEach(o => {
        logtail.info(o.orderId.toString());
        getOrderData(o.orderId).then(order => {
            const customerPaymentRecord = createCustomerPaymentRecordFromOrder(order);
            if (parseFloat(customerPaymentRecord.amountAuthorized) > 0) {
                sendCustomerPaymentToBrightPearl(customerPaymentRecord);
            }
        })
        .catch(err => {
            logtail.info(err.message);
            return err
        });
    });
};

module.exports = {
    captureBrightpearlOrderPayment,
    getOtherOrders,
    mapOrderPaymentStatusName,
    parseBrightPearlResponseIntoObjects,
    processOtherOrders,
    processUnpaidOrders,
    removePaidOrders,
}
