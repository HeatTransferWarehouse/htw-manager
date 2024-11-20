import { put, takeLatest, call } from "redux-saga/effects";
import axios from "axios";

const defaultRoute = "/api/products/sff";

/* ------------------------- Descriptions ------------------------- */

function* getDescriptionsSyncStatus() {
  try {
    const response = yield call(
      axios.get,
      `${defaultRoute}/descriptions/syncs/status`
    );
    yield put({
      type: "SET_SFF_DESCRIPTIONS_SYNC_STATUS",
      payload: response.data,
    });
  } catch (error) {
    console.error("Error fetching descriptions sync status:", error);
  }
}

function* syncDescriptionProducts() {
  try {
    yield call(axios.post, `${defaultRoute}/descriptions`);
    yield call(axios.post, `${defaultRoute}/descriptions/syncs`);
    yield put({ type: "FETCH_SFF_DESCRIPTION_PRODUCTS" });
    yield put({
      type: "FETCH_SFF_DESCRIPTION_SYNC_DATA",
      payload: { query: true },
    });
    yield put({ type: "FETCH_SFF_DESCRIPTIONS_SYNC_STATUS" });
  } catch (error) {}
}

function* getDescriptionProducts() {
  try {
    const response = yield call(axios.get, `${defaultRoute}/descriptions`);
    yield put({ type: "SET_SFF_DESCRIPTION_PRODUCTS", payload: response.data });
  } catch (error) {
    console.error("Error fetching description products:", error);
  }
}

function* getDescriptionSyncData(action) {
  if (action.payload.query) {
    try {
      const response = yield call(
        axios.get,
        `${defaultRoute}/descriptions/syncs?is_last_sync=${action.payload.query}`
      );
      yield put({
        type: "SET_SFF_DESCRIPTION_SYNC_DATA",
        payload: response.data,
      });
    } catch (error) {
      console.error("Error fetching description sync data:", error);
    }
  } else {
    try {
      const response = yield call(
        axios.get,
        `${defaultRoute}/descriptions/syncs`
      );
      yield put({
        type: "SET_SFF_DESCRIPTION_SYNC_DATA",
        payload: response.data,
      });
    } catch (error) {
      console.error("Error fetching description sync data:", error);
    }
  }
}

/* ------------------------- Images ------------------------- */

function* getImagesSyncStatus() {
  try {
    const response = yield call(
      axios.get,
      `${defaultRoute}/images/syncs/status`
    );
    yield put({ type: "SET_SFF_IMAGES_SYNC_STATUS", payload: response.data });
  } catch (error) {
    console.error("Error fetching images sync status:", error);
  }
}

function* syncImageProducts() {
  try {
    yield call(axios.post, `${defaultRoute}/images`);
    yield call(axios.post, `${defaultRoute}/images/syncs`);
    yield put({ type: "FETCH_SFF_IMAGE_PRODUCTS" });
    yield put({
      type: "FETCH_SFF_IMAGE_SYNC_DATA",
      payload: {
        query: true,
      },
    });
    yield put({ type: "FETCH_SFF_IMAGES_SYNC_STATUS" });
  } catch (error) {
    console.error("Error syncing image products:", error);
  }
}

function* getImageProducts() {
  try {
    const response = yield call(axios.get, `${defaultRoute}/images`);
    yield put({ type: "SET_SFF_IMAGE_PRODUCTS", payload: response.data });
  } catch (error) {
    console.error("Error fetching image products:", error);
  }
}

function* getImageSyncData(action) {
  if (action.payload.query) {
    try {
      const response = yield call(
        axios.get,
        `${defaultRoute}/images/syncs?is_last_sync=${action.payload.query}`
      );
      yield put({ type: "SET_SFF_IMAGE_SYNC_DATA", payload: response.data });
    } catch (error) {
      console.error("Error fetching image sync data:", error);
    }
  } else {
    try {
      const response = yield call(axios.get, `${defaultRoute}/images/syncs`);
      yield put({ type: "SET_SFF_IMAGE_SYNC_DATA", payload: response.data });
    } catch (error) {
      console.error("Error fetching image sync data:", error);
    }
  }
}

function* sffProductsSaga() {
  // Descriptions
  yield takeLatest("FETCH_SFF_DESCRIPTION_PRODUCTS", getDescriptionProducts);
  yield takeLatest("FETCH_SFF_DESCRIPTION_SYNC_DATA", getDescriptionSyncData);
  yield takeLatest(
    "FETCH_SFF_DESCRIPTIONS_SYNC_STATUS",
    getDescriptionsSyncStatus
  );
  yield takeLatest("SYNC_SFF_DESCRIPTION_PRODUCTS", syncDescriptionProducts);
  // Images
  yield takeLatest("FETCH_SFF_IMAGE_PRODUCTS", getImageProducts);
  yield takeLatest("FETCH_SFF_IMAGE_SYNC_DATA", getImageSyncData);
  yield takeLatest("FETCH_SFF_IMAGES_SYNC_STATUS", getImagesSyncStatus);
  yield takeLatest("SYNC_SFF_IMAGE_PRODUCTS", syncImageProducts);
}

export default sffProductsSaga;
