import { put, takeLatest, call } from "redux-saga/effects";
import axios from "axios";

function* syncProducts() {
  try {
    yield put({ type: "SYNC_PRODUCTS_LOADING" });
    yield call(axios.post, "/api/products/empty-descriptions/sync");
    yield call(axios.post, "/api/products/populate-sync-data");
    yield put({ type: "SYNC_PRODUCTS_FINISHED" });
    yield put({ type: "FETCH_PRODUCTS_NO_DESC" });
    yield put({ type: "FETCH_LAST_SYNC" });
    yield put({ type: "FETCH_SYNC_STATUS" });
  } catch (error) {
    yield put({ type: "SYNC_PRODUCTS_ERROR", payload: error });
    yield put({ type: "SYNC_PRODUCTS_FINISHED" });
    yield put({ type: "FETCH_SYNC_STATUS" });
  }
}

function* getLastSyncData() {
  try {
    const response = yield call(axios.get, "/api/products/syncs/last");
    yield put({ type: "SET_LAST_SYNC_DATA", payload: response.data });
  } catch (error) {
    console.error("Error fetching sync data:", error);
  }
}

function* getAllProductsWithNoDescription() {
  try {
    const url = `/api/products/all
    `;
    const response = yield call(axios.get, url);
    yield put({ type: "SET_PRODUCTS_NO_DESC", payload: response.data });
  } catch (error) {
    console.error("Error fetching products with no descriptions:", error);
  }
}

function* getSyncStatus() {
  try {
    const response = yield call(axios.get, "/api/products/sync/status");
    yield put({ type: "SET_SYNC_STATUS", payload: response.data });
  } catch (error) {
    console.error("Error fetching sync status:", error);
  }
}

function* syncSffProducts() {
  try {
    yield put({ type: "SYNC_PRODUCTS_LOADING" });
    yield call(axios.post, "/api/products/sff/empty-descriptions/sync");
    yield call(axios.post, "/api/products/sff/populate-sync-data");
    yield put({ type: "SYNC_PRODUCTS_FINISHED" });
    yield put({ type: "FETCH_SFF_PRODUCTS_NO_DESC" });
    yield put({ type: "FETCH_SFF_LAST_SYNC" });
    yield put({ type: "FETCH_SFF_SYNC_STATUS" });
  } catch (error) {
    yield put({ type: "SYNC_PRODUCTS_ERROR", payload: error });
    yield put({ type: "SYNC_PRODUCTS_FINISHED" });
    yield put({ type: "FETCH_SFF_SYNC_STATUS" });
  }
}

function* getSffLastSyncData() {
  try {
    const response = yield call(axios.get, "/api/products/sff/syncs/last");
    yield put({ type: "SET_SFF_LAST_SYNC_DATA", payload: response.data });
  } catch (error) {
    console.error("Error fetching sync data:", error);
  }
}

function* getAllSffProductsWithNoDescription(action) {
  try {
    const url = `/api/products/sff/all
    `;
    const response = yield call(axios.get, url);
    yield put({ type: "SET_SFF_PRODUCTS_NO_DESC", payload: response.data });
  } catch (error) {
    console.error("Error fetching products with no descriptions:", error);
  }
}

function* getSffSyncStatus() {
  try {
    const response = yield call(axios.get, "/api/products/sff/sync/status");
    yield put({ type: "SET_SFF_SYNC_STATUS", payload: response.data });
  } catch (error) {
    console.error("Error fetching sync status:", error);
  }
}

function* productsSaga() {
  yield takeLatest("SYNC_CATALOG", syncProducts);
  yield takeLatest("SYNC_SFF_CATALOG", syncSffProducts);
  yield takeLatest("FETCH_PRODUCTS_NO_DESC", getAllProductsWithNoDescription);
  yield takeLatest(
    "FETCH_SFF_PRODUCTS_NO_DESC",
    getAllSffProductsWithNoDescription
  );
  yield takeLatest("FETCH_LAST_SYNC", getLastSyncData);
  yield takeLatest("FETCH_SFF_LAST_SYNC", getSffLastSyncData);
  yield takeLatest("FETCH_SYNC_STATUS", getSyncStatus);
  yield takeLatest("FETCH_SFF_SYNC_STATUS", getSffSyncStatus);
}

export default productsSaga;
