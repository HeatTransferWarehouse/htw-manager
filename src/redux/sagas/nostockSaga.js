
import { put, takeLatest } from 'redux-saga/effects';
import axios from 'axios'

function* getitemlist(action) {
  try {
    const response = yield axios.get(`/api/nostock/getitems`);
    yield put({
      type: "SET_NO_STOCK",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* updateItems(action) {
  try {
    yield put({
      type: "SET_UPDATING",
    });
    const response = yield axios.get(`/api/nostock/items`);
    yield put({
      type: "SET_NO_STOCK",
      payload: response.data,
    });
    yield put({
      type: "SET_DONE",
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* markStocked(action) {
  const id = action.payload.items;
  try {
    const response = yield axios.delete(`/api/nostock/items/${id}`);
    yield put({
      type: "CLEAR_CHECKED",
    });
    yield put({
      type: "SET_NO_STOCK",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* markDead(action) {
  try {
    const response = yield axios.put(`/api/nostock/items/mark`, action.payload);
    yield put({
      type: "CLEAR_CHECKED",
    });
    yield put({
      type: "SET_NO_STOCK",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* unmarkDead(action) {
  try {
    const response = yield axios.put(`/api/nostock/deadItems`, action.payload);
    yield put({
      type: "SET_NO_STOCK",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* changeReason(action) {
  const payload = action.payload;
  try {
    const response = yield axios.put(`/api/nostock/updateReason`, {payload: payload});
    yield put({
      type: "SET_NO_STOCK",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* updateNotes(action) {
  try {
    const response = yield axios.put(`/api/nostock/items/notes`, action.payload);
    yield put({
      type: "CLEAR_CHECKED",
    });
    yield put({
      type: "SET_NO_STOCK",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* testNSN(action) {
  try {
    yield axios.put(`/api/nostock/test`, action.payload);
  } catch (error) {
    console.log("Error with testing NSN:", error);
  }
}


//this takes all of the Saga functions and dispatches them
function* itemSaga() {
    yield takeLatest('GET_NO_STOCK_LIST', getitemlist);
    yield takeLatest('UPDATE_ITEMS', updateItems);
    yield takeLatest('MARK_STOCKED', markStocked);
    yield takeLatest('MARK_DEAD', markDead);
    yield takeLatest('UNMARK_DEAD', unmarkDead);
    yield takeLatest('CHANGE_REASON', changeReason);
    yield takeLatest('UPDATE_NOTES', updateNotes);
    yield takeLatest('TEST_NSN', testNSN);
}

export default itemSaga;