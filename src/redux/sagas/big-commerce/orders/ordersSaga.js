import { put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';

function* splitOrder(action) {
  try {
    const { orderId, shipments, view, page, rowsPerPage } = action.payload;
    yield axios.post(`/api/big-commerce/orders/split`, { orderId, shipments });
    yield put({ type: 'GET_ORDERS', payload: { page, filter: view, limit: rowsPerPage } }); // Refresh orders
  } catch (err) {
    console.error('Error in splitOrder Saga:', err);
  }
}

function* combineOrders(action) {
  try {
    const { view, page, rowsPerPage, orderId, shipments } = action.payload;
    yield axios.post(`/api/big-commerce/orders/merge`, { orderId, shipments });
    yield put({ type: 'GET_ORDERS', payload: { page, limit: rowsPerPage, filter: view } }); // Refresh orders
  } catch (err) {
    console.error('Error in combineOrders Saga:', err);
  }
}

function* getOrders(action) {
  try {
    const page = action.payload?.page || 1; // default page = 1
    const limit = action.payload?.limit || 100; // default limit = 100
    const filter = action.payload?.filter || 'all'; // optional filter
    const search = action.payload?.search || ''; // optional search

    const response = yield axios.get('/api/big-commerce/orders', {
      params: { page, limit, filter, search },
    });

    // API returns: { orders: [...], pagination: {...} }
    yield put({
      type: 'SET_ORDERS',
      payload: {
        orders: response.data.orders,
        pagination: response.data.pagination,
      },
    });
  } catch (err) {
    console.error('Error in getOrders Saga:', err);
  }
}

function* markOrdersPrinted(action) {
  const page = action.payload?.page || 1; // default page = 1
  const limit = action.payload?.limit || 100; // default limit = 100
  const filter = action.payload?.filter || 'all'; // optional filter
  const search = action.payload?.search || ''; // optional search
  const orderIds = action.payload?.orderIds || []; // array of order IDs to mark as printed
  try {
    yield axios.put(`/api/big-commerce/orders/mark-printed`, {
      orderIds: orderIds, // this should be an array of order IDs
    });
    yield put({
      type: 'GET_ORDERS',
      payload: {
        page,
        limit,
        filter,
        search,
      },
    }); // Refresh orders
  } catch (err) {
    console.log('Error in markOrdersPrinted Saga', err);
  }
}

function* generatePDF(action) {
  try {
    const response = yield axios.post(`/api/big-commerce/orders/print-pdf`, {
      html: action.payload.html,
    });
    if (response.data.success) {
      console.log('Print job sent successfully');
    } else {
      console.error('Failed to send print job:', response.data.message);
    }
  } catch (err) {
    console.error('Error in generatePDF Saga', err);
  }
}

function* syncOrders() {
  try {
    yield put({ type: 'SET_SYNCING', payload: true });
    yield axios.post(`/api/big-commerce/orders/sync`);
    yield put({ type: 'GET_ORDERS' }); // Refresh orders after sync
  } catch (err) {
    console.log('Error in syncOrders Saga', err);
  } finally {
    yield put({ type: 'SET_SYNCING', payload: false });
  }
}

function* getLocalPrinters() {
  try {
    const response = yield axios.get(`/api/big-commerce/orders/printers`);
    if (response.status === 200 && response.data.printers) {
      yield put({ type: 'SET_PRINTERS', payload: response.data.printers });
    } else {
      console.error('Failed to fetch printers:', response.data.message);
    }
  } catch (err) {
    console.error('Error in getLocalPrinters Saga', err);
  }
}

function* deleteOrders(action) {
  try {
    yield axios.delete(`/api/big-commerce/orders`, {
      data: { orderIds: action.payload }, // this should be an array of order IDs
    });
    yield put({ type: 'GET_ORDERS' }); // Refresh orders
  } catch (err) {
    console.log('Error in deleteOrders Saga', err);
  }
}

function* getTags() {
  try {
    const response = yield axios.get(`/api/big-commerce/orders/tags`);
    if (response.status === 200 && response.data.tags) {
      yield put({ type: 'SET_TAGS', payload: response.data.tags });
    } else {
      console.error('Failed to fetch tags:', response.data.message);
    }
  } catch (err) {
    console.error('Error in getTags Saga', err);
  }
}

function* ordersSaga() {
  yield takeLatest('GET_ORDERS', getOrders);
  yield takeLatest('MARK_ORDERS_PRINTED', markOrdersPrinted);
  yield takeLatest('GENERATE_PDF', generatePDF);
  yield takeLatest('SYNC_ORDERS', syncOrders);
  yield takeLatest('GET_PRINTERS', getLocalPrinters);
  yield takeLatest('DELETE_ORDERS', deleteOrders);
  yield takeLatest('GET_TAGS', getTags);
  yield takeLatest('SPLIT_ORDER', splitOrder);
  yield takeLatest('COMBINE_ORDERS', combineOrders);
}

export default ordersSaga;
