import { put, takeLatest, race, delay, call } from 'redux-saga/effects';
import axios from 'axios';
const storeKey = 'sff';

function* splitOrder(action) {
  try {
    const { orderId, shipments, view, page, rowsPerPage } = action.payload;
    yield axios.post(`/api/big-commerce/orders/split`, { orderId, shipments, storeKey });
    yield put({ type: 'GET_SFF_ORDERS', payload: { page, filter: view, limit: rowsPerPage } }); // Refresh orders
  } catch (err) {
    yield put({
      type: 'SET_SFF_ORDERS_ERROR',
      payload: {
        title: 'Error Splitting Order',
        message: err.message || 'An error occurred while splitting the order.',
      },
    });
    yield delay(5000);
    yield put({ type: 'CLEAR_SFF_ORDERS_ERROR' });
    console.error('Error in splitOrder Saga:', err);
  }
}

function* combineOrders(action) {
  try {
    const { view, page, rowsPerPage, orderId, shipments } = action.payload;
    yield axios.post(`/api/big-commerce/orders/merge`, { orderId, shipments, storeKey });
    yield put({ type: 'GET_SFF_ORDERS', payload: { page, limit: rowsPerPage, filter: view } }); // Refresh orders
  } catch (err) {
    yield put({
      type: 'SET_SFF_ORDERS_ERROR',
      payload: {
        title: 'Error Combining Orders',
        message: err.message || 'An error occurred while combining the orders.',
      },
    });
    yield delay(5000);
    yield put({ type: 'CLEAR_SFF_ORDERS_ERROR' });
  }
}

function* addOrder(action) {
  try {
    const { orderId, view, page, rowsPerPage } = action.payload;

    // ✅ store the response
    const response = yield call(axios.post, `/api/big-commerce/orders/add`, {
      orderId,
      storeKey,
    });

    // Refresh orders
    yield put({
      type: 'GET_SFF_ORDERS',
      payload: { page, filter: view, limit: rowsPerPage },
    });

    // ✅ use message from server if provided
    yield put({
      type: 'SET_SFF_ORDERS_SUCCESS',
      payload: {
        title: `Order ${orderId} Added`,
        message: response.data?.message || `Order ${orderId} was successfully added.`,
      },
    });
  } catch (err) {
    yield put({
      type: 'SET_SFF_ORDERS_ERROR',
      payload: {
        title: 'Error Adding Order',
        message:
          err.response?.data?.message || err.message || 'An error occurred while adding the order.',
      },
    });

    yield delay(5000);
    yield put({ type: 'CLEAR_SFF_ORDERS_ERROR' });
  }
}

function* getOrders(action) {
  try {
    const page = action.payload?.page || 1;
    const limit = action.payload?.limit || 100;
    const filter = action.payload?.filter || 'all';
    const search = action.payload?.search || '';
    const sort = action.payload?.sort || '';

    // Kick off API call immediately
    const apiCall = call(axios.get, '/api/big-commerce/orders', {
      params: { page, limit, filter, search, sort, storeKey },
    });

    // Race between API response and delay
    const { response, loadingDelay } = yield race({
      response: apiCall,
      loadingDelay: delay(200), // only show loader if it takes longer than 200ms
    });

    if (loadingDelay) {
      // If delay finishes first → show loader and wait for API
      yield put({ type: 'SET_SFF_ORDERS_LOADING', payload: true });
      const resp = yield apiCall; // wait for API to finish
      yield put({
        type: 'SET_SFF_ORDERS',
        payload: { orders: resp.data.orders, pagination: resp.data.pagination },
      });
    } else if (response) {
      // If API finished before 200ms → skip showing loader
      yield put({
        type: 'SET_SFF_ORDERS',
        payload: { orders: response.data.orders, pagination: response.data.pagination },
      });
    }
  } catch (err) {
    yield put({
      type: 'SET_SFF_ORDERS_ERROR',
      payload: {
        title: 'Error Fetching Orders',
        message: err.message || 'An error occurred while fetching orders.',
      },
    });
    yield delay(5000);
    yield put({ type: 'CLEAR_SFF_ORDERS_ERROR' });
    console.error('Error in getOrders Saga:', err);
  } finally {
    yield put({ type: 'SET_SFF_ORDERS_LOADING', payload: false });
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
      storeKey,
    });
    yield put({
      type: 'GET_SFF_ORDERS',
      payload: {
        page,
        limit,
        filter,
        search,
      },
    }); // Refresh orders
  } catch (err) {
    yield put({
      type: 'SET_SFF_ORDERS_ERROR',
      payload: {
        title: 'Error Marking Orders as Printed',
        message: err.message || 'An error occurred while marking orders as printed.',
      },
    });
    yield delay(5000);
    yield put({ type: 'CLEAR_SFF_ORDERS_ERROR' });
    console.log('Error in markOrdersPrinted Saga', err);
  }
}

function* generatePDF(action) {
  try {
    const response = yield axios.post(`/api/big-commerce/orders/print-pdf`, {
      html: action.payload.html,
      storeKey,
    });
    if (response.data.success) {
      console.log('Print job sent successfully');
    } else {
      console.error('Failed to send print job:', response.data.message);
    }
  } catch (err) {
    yield put({
      type: 'SET_SFF_ORDERS_ERROR',
      payload: {
        title: 'Error Generating PDF',
        message: err.message || 'An error occurred while generating the PDF.',
      },
    });
    console.error('Error in generatePDF Saga', err);
  }
}

function* syncOrders() {
  try {
    yield put({ type: 'SET_SFF_SYNCING', payload: true });
    yield axios.post(`/api/big-commerce/orders/sync`, {
      storeKey,
    });
    yield put({ type: 'GET_SFF_ORDERS' }); // Refresh orders after sync
  } catch (err) {
    yield put({
      type: 'SET_SFF_ORDERS_ERROR',
      payload: {
        title: 'Error Syncing Orders',
        message: err.message || 'An error occurred while syncing orders.',
      },
    });
    yield delay(5000);
    yield put({ type: 'CLEAR_SFF_ORDERS_ERROR' });
    console.log('Error in syncOrders Saga', err);
  } finally {
    yield put({ type: 'SET_SFF_SYNCING', payload: false });
  }
}

function* getLocalPrinters() {
  try {
    const response = yield axios.get(`/api/big-commerce/orders/printers`, {
      params: { storeKey },
    });
    if (response.status === 200 && response.data.printers) {
      yield put({ type: 'SET_PRINTERS', payload: response.data.printers });
    } else {
      console.error('Failed to fetch printers:', response.data.message);
    }
  } catch (err) {
    yield put({
      type: 'SET_SFF_ORDERS_ERROR',
      payload: {
        title: 'Error Fetching Printers',
        message: err.message || 'An error occurred while fetching printers.',
      },
    });
    yield delay(5000);
    yield put({ type: 'CLEAR_SFF_ORDERS_ERROR' });
    console.error('Error in getLocalPrinters Saga', err);
  }
}

function* deleteOrders(action) {
  try {
    yield axios.delete(`/api/big-commerce/orders`, {
      data: { orderIds: action.payload, storeKey },
    });
    yield put({ type: 'GET_SFF_ORDERS' }); // Refresh orders
  } catch (err) {
    yield put({
      type: 'SET_SFF_ORDERS_ERROR',
      payload: {
        title: 'Error Deleting Orders',
        message: err.message || 'An error occurred while deleting orders.',
      },
    });
    yield delay(5000);
    yield put({ type: 'CLEAR_SFF_ORDERS_ERROR' });
    console.log('Error in deleteOrders Saga', err);
  }
}

function* getTags() {
  try {
    const response = yield axios.get(`/api/big-commerce/orders/tags`, {
      params: { storeKey },
    });
    if (response.status === 200 && response.data.tags) {
      yield put({ type: 'SET_TAGS', payload: response.data.tags });
    } else {
      console.error('Failed to fetch tags:', response.data.message);
    }
  } catch (err) {
    yield put({
      type: 'SET_SFF_ORDERS_ERROR',
      payload: {
        title: 'Error Fetching Tags',
        message: err.message || 'An error occurred while fetching tags.',
      },
    });
    yield delay(5000);
    yield put({ type: 'CLEAR_SFF_ORDERS_ERROR' });
    console.error('Error in getTags Saga', err);
  }
}

function* sffOrdersSaga() {
  yield takeLatest('GET_SFF_ORDERS', getOrders);
  yield takeLatest('MARK_SFF_ORDERS_PRINTED', markOrdersPrinted);
  yield takeLatest('GENERATE_SFF_PDF', generatePDF);
  yield takeLatest('SYNC_SFF_ORDERS', syncOrders);
  yield takeLatest('GET_SFF_PRINTERS', getLocalPrinters);
  yield takeLatest('DELETE_SFF_ORDERS', deleteOrders);
  yield takeLatest('GET_SFF_TAGS', getTags);
  yield takeLatest('SPLIT_SFF_ORDER', splitOrder);
  yield takeLatest('COMBINE_SFF_ORDERS', combineOrders);
  yield takeLatest('ADD_SFF_ORDER', addOrder);
}

export default sffOrdersSaga;
