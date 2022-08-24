
import { put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';

function* deleteItem(action) {
  try {
    yield axios.delete(`/api/item/queue/deleteitem/${action.payload}`)
    yield put({ type: "GET_QUEUE_ITEM_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* deleteProgress(action) {
  try {
    yield axios.delete(`/api/item/queue/deleteprogress/${action.payload}`);
    yield put({ type: "GET_PROGRESS_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* deleteHistory(action) {
  try {
    yield axios.delete(`/api/item/queue/deletehistory/${action.payload}`);
    yield put({ type: "GET_HISTORY_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* deleteComplete(action) {
  try {
    yield axios.delete(`/api/item/queue/deletecomplete/${action.payload}`);
    yield put({ type: "GET_COMPLETE_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* deleteCompleteRange(action) {
  try {
    yield axios.delete(`/api/user/queue/deletecompleterange`);
    yield put({ type: "GET_COMPLETE_LIST" });
    yield put({ type: "GET_ITEM_LIST_COUNT" });
    yield put({ type: "GET_PROGRESS_LIST_COUNT" });
    yield put({ type: "GET_COMPLETE_LIST_COUNT" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* deleteHistoryRange(action) {
  try {
    yield axios.delete(`/api/user/queue/deletehistoryrange`);
    yield put({ type: "GET_COMPLETE_LIST" });
    yield put({ type: "GET_ITEM_LIST_COUNT" });
    yield put({ type: "GET_PROGRESS_LIST_COUNT" });
    yield put({ type: "GET_COMPLETE_LIST_COUNT" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* startTask(action) {
  try {
    yield axios.post("/api/user/queue/starttask", action.payload);
    yield put({ type: "GET_PROGRESS_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}


function* markComplete(action) {
  try {
    yield axios.post("/api/user/queue/markcomplete", action.payload);
    yield put({ type: "GET_COMPLETE_LIST" });
    yield put({ type: "GET_COMPLETE_LIST_COUNT" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* goBackNew(action) {
  try {
    yield axios.post("/api/user/queue/gobacknew", action.payload);
    yield put({ type: "GET_QUEUE_ITEM_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* needToRun(action) {
  try {
    yield axios.put("/api/item/queue/run", action.payload);
    yield put({ type: "GET_QUEUE_ITEM_LIST" });
  } catch (error) {
    console.log("Error with editing an item:", error);
  }
}

function* getitemlist(action) {
  try {
    const response = yield axios.get(`/api/item/queue/itemlist`);
    yield put({
      type: "SET_ITEM",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* checkHistory(action) {
  try {
    const response = yield axios.post("api/item/checkhistory", action.payload);
    yield put({
      type: "SET_HISTORY_TABLE",
      payload: response.data,
    });
  } catch (error) {
    yield put({ type: "STUDENT_REGISTRATION_FAILED" });
  }
}

function* getitemlistcount(action) {
  try {
    const response = yield axios.get(`/api/item/queue/itemlistcount`);
    yield put({
      type: "SET_ITEM_COUNT",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getprogresslist(action) {
  try {
    const response = yield axios.get(`/api/item/queue/progresslist`);
    yield put({
      type: "SET_PROGRESS",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getprogresslistcount(action) {
  try {
    const response = yield axios.get(`/api/item/queue/progresslistcount`);
    yield put({
      type: "SET_PROGRESS_COUNT",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getconfirmlist(action) {
  try {
    const response = yield axios.get(`/api/item/queue/confirmlist`);
    yield put({
      type: "SET_CONFIRM",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}



function* getconfirmlistcount(action) {
  try {
    const response = yield axios.get(`/api/item/queue/confirmlistcount`);
    yield put({
      type: "SET_CONFIRM_COUNT",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getrespondlist(action) {
  try {
    const response = yield axios.get(`/api/item/queue/respondlist`);
    yield put({
      type: "SET_RESPOND",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getrespondlistcount(action) {
  try {
    const response = yield axios.get(`/api/item/queue/respondlistcount`);
    yield put({
      type: "SET_RESPOND_COUNT",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getapprovelist(action) {
  try {
    const response = yield axios.get(`/api/item/queue/approvelist`);
    yield put({
      type: "SET_APPROVE",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getapprovelistcount(action) {
  try {
    const response = yield axios.get(`/api/item/queue/approvelistcount`);
    yield put({
      type: "SET_APPROVE_COUNT",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getcompletelist(action) {
  try {
    const response = yield axios.get(`/api/item/queue/completelist`);
    yield put({
      type: "SET_COMPLETE_QUEUE",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getcompletelistcount(action) {
  try {
    const response = yield axios.get(`/api/item/queue/completelistcount`);
    yield put({
      type: "SET_COMPLETE_COUNT",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* orderDetails(action) {
  try {
    const response = yield axios.post("/api/item/queue/orderdetails", action.payload);
    yield put({
      type: "SET_DETAILS",
      payload: response.data,
    });
  } catch (error) {
    yield put({ type: "STUDENT_REGISTRATION_FAILED" });
  }
}

function* orderLookup(action) {
  try {
    const response = yield axios.post("/api/item/queue/orderlookup", action.payload);
    yield put({
      type: "SET_ORDER",
      payload: response.data,
    });
  } catch (error) {
    yield put({ type: "STUDENT_REGISTRATION_FAILED" });
  }
}

function* shippingLookup(action) {
  try {
    const response = yield axios.post("/api/item/queue/shippinglookup", action.payload);
    yield put({
      type: "SET_SHIPPING",
      payload: response.data,
    });
  } catch (error) {
    yield put({ type: "STUDENT_REGISTRATION_FAILED" });
  }
}

function* productLookup(action) {
  try {
    const response = yield axios.post(
      "/api/item/queue/productlookup",
      action.payload
    );
    yield put({
      type: "SET_PRODUCT",
      payload: response.data,
    });
  } catch (error) {
    yield put({ type: "STUDENT_REGISTRATION_FAILED" });
  }
}


//this takes all of the Saga functions and dispatches them
function* QueueItemSaga() {
  yield takeLatest('CHECK_HISTORY', checkHistory);
  yield takeLatest('START_ITEM', startTask);
  yield takeLatest('MARK_COMPLETE', markComplete);
  yield takeLatest('ADD_NEW', goBackNew);
  yield takeLatest('NEED_TO_RUN', needToRun);
  yield takeLatest('GET_QUEUE_ITEM_LIST', getitemlist);
  yield takeLatest('GET_ITEM_LIST_COUNT', getitemlistcount);
  yield takeLatest('GET_PROGRESS_LIST', getprogresslist);
  yield takeLatest('GET_PROGRESS_LIST_COUNT', getprogresslistcount);
  yield takeLatest('GET_CONFIRM_LIST', getconfirmlist);
  yield takeLatest('GET_CONFIRM_LIST_COUNT', getconfirmlistcount);
  yield takeLatest('GET_RESPOND_LIST', getrespondlist);
  yield takeLatest('GET_RESPOND_LIST_COUNT', getrespondlistcount);
  yield takeLatest('GET_APPROVE_LIST', getapprovelist);
  yield takeLatest('GET_APPROVE_LIST_COUNT', getapprovelistcount);
  yield takeLatest('GET_COMPLETE_LIST', getcompletelist);
  yield takeLatest('GET_COMPLETE_LIST_COUNT', getcompletelistcount);
  yield takeLatest('DELETE_ITEM_QUEUE', deleteItem);
  yield takeLatest('DELETE_PROGRESS', deleteProgress);
  yield takeLatest('DELETE_HISTORY', deleteHistory);
  yield takeLatest('DELETE_COMPLETE', deleteComplete);
  yield takeLatest('DELETE_COMPLETE_RANGE', deleteCompleteRange);
  yield takeLatest('DELETE_HISTORY_RANGE', deleteHistoryRange);
  yield takeLatest('ORDER_DETAILS', orderDetails);
  yield takeLatest('ORDER_LOOKUP', orderLookup);
  yield takeLatest('SHIPPING_LOOKUP', shippingLookup);
  yield takeLatest('PRODUCT_LOOKUP', productLookup);
}

export default QueueItemSaga;