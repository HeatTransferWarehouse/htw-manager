require('dotenv').config();
const axios = require('axios');

const axiosOptions = (method, resourcePath) => {
    const HEADERS = {
        'brightpearl-app-ref': process.env.BRIGHTPEARL_APP_REF,
        'brightpearl-account-token': process.env.BRIGHTPEARL_ACCOUNT_TOKEN,
    };
    return {
        method,
        url: `https://ws-use.brightpearl.com/public-api/heattransfer/${resourcePath}`,
        port: '443',
        //This is the only line that is new. `headers` is an object with the headers to request
        headers: HEADERS
    }
};

const axiosOptionsBody = (method, resourcePath, body) => {
    console.log(body);
    const HEADERS = {
        'brightpearl-app-ref': process.env.BRIGHTPEARL_APP_REF,
        'brightpearl-account-token': process.env.BRIGHTPEARL_ACCOUNT_TOKEN,
    };
    return {
        method,
        url: `https://ws-use.brightpearl.com/public-api/heattransfer/${resourcePath}`,
        port: '443',
        //This is the only line that is new. `headers` is an object with the headers to request
        headers: HEADERS,
        body: body
    }
};

const brightpearlAPI = (options) => {
    console.log(`${options.method} ${options.url}`);
    return axios({
        ...options
    });
}

const getUnpaidBrightpearlOrders = async (e) => {
    const UNPAID_ORDERS_INTERVAL = e * 60;
    const now = new Date();
    const then = new Date();
    then.setSeconds(now.getSeconds() - UNPAID_ORDERS_INTERVAL);
    const options = axiosOptions('GET', `order-service/order-search/?orderTypeId=1&placedOn=${then.toISOString()}/${now.toISOString()}`);
    const orderData = await brightpearlAPI(options)
    .then(r => r.data)
    .catch(err => {
        console.error(err.message);
        return [];
    });
    return orderData;
};

const getSO = async (e) => {
    const options = axiosOptions('GET', `order-service/sales-order-search/?customerRef=${e}`);
    const orderData = await brightpearlAPI(options)
        .then(r => r.data)
        .catch(err => {
            console.error(err.message);
            return [];
        });
    return orderData;
};

const updateNote = async (e) => {
    const options = axiosOptionsBody('POST', `order-service/order/${e}/note`, { "text": "Email Sent via manager app" });
    const orderData = await brightpearlAPI(options)
        .then(r => r.data)
        .catch(err => {
            console.error(err.message);
            return [];
        });
    return orderData;
};

const getOrderData = async orderId => {
    const options = axiosOptions('GET', `order-service/order/${orderId}`);
    const orderData = brightpearlAPI(options)
    .then(r => r.data.response[0])
    .catch(err => {
        console.log(err.message.toString());
        return null;
    });
    return orderData;
};

const getOrderCustomerPayment = async order => {
    const options = axiosOptions('GET', `accounting-service/customer-payment-search/?orderId=${order.orderId}`);
    const customerPaymentData = brightpearlAPI(options)
    .then(r => r.data)
    .catch(err => {
        console.log(err.message);
        return [];
    });
    return customerPaymentData
};

const sendCustomerPaymentToBrightPearl = async cp => {
    const options = axiosOptions('POST', 'accounting-service/customer-payment/');
    options.data = cp;
    const customerPaymentData = brightpearlAPI(options)
    .then(r => {
        console.log('sendCustomerPaymentToBrightPearl POST result: ', r.data);
        return r.data
    })
    .catch(err => {
        console.log(err.message.toString());
        return null;
    });
    return customerPaymentData;
};

module.exports = {
    getOrderData,
    getOrderCustomerPayment,
    getUnpaidBrightpearlOrders,
    sendCustomerPaymentToBrightPearl,
    updateNote,
    getSO
}