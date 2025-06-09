import { put, takeLatest, call } from "redux-saga/effects";
import axios from "axios";

function* getJDSProductData(action) {
  try {
    yield put({ type: "SET_JDS_LOADING", payload: true });

    const response = yield axios.get(
      `/api/jds/products?skus=${action.payload.join(",")}`
    );

    yield put({
      type: "SET_JDS_PRODUCTS_TO_IMPORT",
      payload: response.data.products,
    });
  } catch (error) {
    yield put({
      type: "SET_JDS_ERROR",
      payload: error?.response?.data?.error || "Unexpected error occurred",
    });
  } finally {
    yield put({ type: "SET_JDS_LOADING", payload: false });
  }
}

function* addJDSProductsToBC(action) {
  const products = action.payload.products;
  const storeToUse = action.payload.store;
  try {
    yield put({ type: "SET_BC_LOADING", payload: true });

    const response = yield axios.post(`/api/jds/bc/products/add`, {
      products,
      store: storeToUse,
    });
    if (response.status === 200) {
      yield put({
        type: "SET_PRODUCT_ADD_SUCCESS",
      });
      yield put({
        type: "CLEAR_JDS_PRODUCTS_TO_IMPORT",
      });
    }
  } catch (error) {
    console.error("Error posting to BigCommerce:", error.response);

    yield put({
      type: "SET_BC_ERROR",
      payload: error?.response.data.message,
    });
  } finally {
    yield put({ type: "SET_BC_LOADING", payload: false });
  }
}

function* getBigCommerceCategories(action) {
  try {
    const storeToUse = action.payload.store || "sandbox";
    const response = yield axios.get(
      `/api/jds/bc/categories?store=${storeToUse}`
    );

    yield put({
      type: "SET_BIG_COMMERCE_CATEGORIES",
      payload: response.data.categories,
    });
  } catch (error) {
    yield put({
      type: "SET_BIG_COMMERCE_CATEGORIES_ERROR",
      payload: error?.response?.data?.error || "Unexpected error occurred",
    });
  }
}

//this takes all of the Saga functions and dispatches them
function* JDSSaga() {
  yield takeLatest("GET_JDS_PRODUCT_DATA", getJDSProductData);
  yield takeLatest("GET_BIG_COMMERCE_CATEGORIES", getBigCommerceCategories);
  yield takeLatest("ADD_JDS_PRODUCTS_TO_BC", addJDSProductsToBC);
}

export default JDSSaga;
