
import { put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';

function* getitemlist(action) {
  try {

    const response = yield axios.get(`/api/affiliate/itemlist`);

    yield put({
      type: "SET_AFFILIATE",
      payload: response.data,
    });

  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* gettopfive(action) {
  try {
    const response = yield axios.get(`/api/affiliate/topfive`);

    yield put({
      type: "SET_TOP_FIVE",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}


function* getemaillist(action) {
  try {

    const response = yield axios.get(`/api/affiliate/email`);

    yield put({
      type: "SET_EMAIL",
      payload: response.data,
    });
    
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* gettotallist(action) {
  try {

    const response = yield axios.get(`/api/affiliate/total`);

    yield put({
      type: "SET_TOTAL",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getskus(action) {
  try {
    const response = yield axios.get(`/api/affiliate/skus`);
    console.log("this is the data", response.data)
    yield put({
      type: "SET_SKUS",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getviewed(action) {
  try {
    const response = yield axios.get(`/api/affiliate/getviewed`);

    yield put({
      type: "SET_VIEWED",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* checkEmail(action) {
  try {
    const response = yield axios.post("/api/affiliate/checkemail", action.payload);
     yield put({
      type: "SET_SKUNUM",
      payload: response.data,
    });

  } catch (error) {
    yield put({ type: "REGISTRATION_FAILED" });
  }
}

function* orderDetails(action) {
  try {
    const response = yield axios.post("/api/affiliate/orderdetails", action.payload);
    yield put({
      type: "SET_DETAILS",
      payload: response.data,
    })
  
    
  } catch (error) {
    yield put({ type: "REGISTRATION_FAILED" });
  }
}

function* deleteItemRange(action) {
  try {
    console.log("we are about to delete everything from 1 year ago", action.payload);
    yield axios.delete(`/api/affiliate/deleteitemrange`);

    yield put({ type: "GET_ITEM_LIST" });
    yield put({ type: "GET_EMAIL_LIST" });
  
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* deleteSkuRange(action) {
  try {
    console.log(
      "we are about to delete everything from 1 year ago",
      action.payload
    );
    yield axios.delete(`/api/affiliate/deleteskurange`);

    yield put({ type: "GET_TOTAL_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

  function* markViewed(action) {
    try {
      yield axios.post("/api/affiliate/viewed", action.payload);
      yield put({ type: "GET_VIEWED" });
    } catch (error) {
      console.log("Error with editing an item:", error);
    }
  }

    function* markUnviewed(action) {
      try {
        console.log("this is action.payload", action.payload)
        yield axios.delete(`/api/affiliate/unviewed/${action.payload}`)
        yield put({ type: "GET_VIEWED" });
      } catch (error) {
        console.log("Error with editing an item:", error);
      }
    }




function* itemSaga() {
    yield takeLatest('GET_AFFILIATE_LIST', getitemlist);
    yield takeLatest('GET_TOP_FIVE', gettopfive);
    yield takeLatest('GET_SKUS', getskus);
    yield takeLatest('GET_EMAIL_LIST', getemaillist);
    yield takeLatest('CHECK_EMAIL', checkEmail);
    yield takeLatest('ORDER_DETAILS', orderDetails);
    yield takeLatest('GET_TOTAL_LIST', gettotallist);
    yield takeLatest('GET_VIEWED', getviewed);
    yield takeLatest('DELETE_ITEM_RANGE', deleteItemRange);
    yield takeLatest('DELETE_SKU_RANGE', deleteSkuRange);
    yield takeLatest('MARK_VIEWED', markViewed);
    yield takeLatest('MARK_UNVIEWED', markUnviewed);
}

export default itemSaga;