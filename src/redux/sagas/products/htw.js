import { put, takeLatest, call } from "redux-saga/effects";
import axios from "axios";

const defaultRoute = "/api/products/htw";

/* ------------------------- Descriptions ------------------------- */

function* getDescriptionsSyncStatus() {
  try {
    const response = yield call(
      axios.get,
      `${defaultRoute}/descriptions/syncs/status`
    );
    yield put({
      type: "SET_HTW_DESCRIPTIONS_SYNC_STATUS",
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
    yield put({ type: "FETCH_HTW_DESCRIPTION_PRODUCTS" });
    yield put({
      type: "FETCH_HTW_DESCRIPTION_SYNC_DATA",
      payload: {
        query: true,
      },
    });
    yield put({ type: "FETCH_HTW_DESCRIPTIONS_SYNC_STATUS" });
  } catch (error) {}
}

function* getDescriptionProducts() {
  try {
    const response = yield call(axios.get, `${defaultRoute}/descriptions`);
    yield put({ type: "SET_HTW_DESCRIPTION_PRODUCTS", payload: response.data });
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
        type: "SET_HTW_DESCRIPTION_SYNC_DATA",
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
        type: "SET_HTW_DESCRIPTION_SYNC_DATA",
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
    yield put({ type: "SET_HTW_IMAGES_SYNC_STATUS", payload: response.data });
  } catch (error) {
    console.error("Error fetching images sync status:", error);
  }
}

function* syncImageProducts() {
  try {
    yield call(axios.post, `${defaultRoute}/images`);
    yield call(axios.post, `${defaultRoute}/images/syncs`);
    yield put({ type: "FETCH_HTW_IMAGE_PRODUCTS" });
    yield put({
      type: "FETCH_HTW_IMAGE_SYNC_DATA",
      payload: {
        query: true,
      },
    });
    yield put({ type: "FETCH_HTW_IMAGES_SYNC_STATUS" });
  } catch (error) {
    console.error("Error syncing image products:", error);
  }
}

function* getImageProducts(action) {
  try {
    const query = action.payload?.query || {};
    const params = new URLSearchParams(query).toString();
    const url = `${defaultRoute}/images${params ? `?${params}` : ""}`;
    const response = yield call(axios.get, url);
    yield put({ type: "SET_HTW_IMAGE_PRODUCTS", payload: response.data });
  } catch (error) {
    console.error("Error fetching image products:", error);
  }
}

function* getImageProductsCount() {
  try {
    const response = yield call(axios.get, `${defaultRoute}/images/count`);
    yield put({ type: "SET_HTW_IMAGE_PRODUCTS_COUNT", payload: response.data });
  } catch (error) {
    console.error("Error fetching image products count:", error);
  }
}

function* getImageSyncData(action) {
  if (action.payload.query) {
    try {
      const response = yield call(
        axios.get,
        `${defaultRoute}/images/syncs?is_last_sync=${action.payload.query}`
      );
      yield put({ type: "SET_HTW_IMAGE_SYNC_DATA", payload: response.data });
    } catch (error) {
      console.error("Error fetching image sync data:", error);
    }
  } else {
    try {
      const response = yield call(axios.get, `${defaultRoute}/images/syncs`);
      yield put({ type: "SET_HTW_IMAGE_SYNC_DATA", payload: response.data });
    } catch (error) {
      console.error("Error fetching image sync data:", error);
    }
  }
}

function* deleteImageProduct(action) {
  console.log("deleteImageProduct action:", action.payload);

  try {
    yield call(axios.delete, `${defaultRoute}/images/${action.payload}`);
    yield put({ type: "FETCH_HTW_IMAGE_PRODUCTS" });
  } catch (error) {
    console.error("Error deleting image product:", error);
  }
}

function* htwProductsSaga() {
  // Descriptions
  yield takeLatest("FETCH_HTW_DESCRIPTION_PRODUCTS", getDescriptionProducts);
  yield takeLatest("FETCH_HTW_DESCRIPTION_SYNC_DATA", getDescriptionSyncData);
  yield takeLatest(
    "FETCH_HTW_DESCRIPTIONS_SYNC_STATUS",
    getDescriptionsSyncStatus
  );
  yield takeLatest("SYNC_HTW_DESCRIPTION_PRODUCTS", syncDescriptionProducts);
  // Images
  yield takeLatest("FETCH_HTW_IMAGE_PRODUCTS", getImageProducts);
  yield takeLatest("FETCH_HTW_IMAGE_PRODUCTS_COUNT", getImageProductsCount);
  yield takeLatest("FETCH_HTW_IMAGE_SYNC_DATA", getImageSyncData);
  yield takeLatest("FETCH_HTW_IMAGES_SYNC_STATUS", getImagesSyncStatus);
  yield takeLatest("SYNC_HTW_IMAGE_PRODUCTS", syncImageProducts);
  yield takeLatest("DELETE_HTW_IMAGE_PRODUCT", deleteImageProduct);
}

export default htwProductsSaga;
