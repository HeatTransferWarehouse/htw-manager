import { put, takeLatest, call } from "redux-saga/effects";
import axios from "axios";

function* getClothingQueueItems(action) {
  const { sort_by, order } = action.payload || {
    sort_by: "date",
    order: "desc",
  };
  try {
    yield put({ type: "START_CLOTHING_QUEUE_LOADING" });
    const response = yield axios.get(
      `/api/clothing-queue/items/get?sort_by=${sort_by}&order=${order}`
    );
    yield put({ type: "SET_CLOTHING_QUEUE_ITEMS", payload: response.data });
    yield put({ type: "SET_CLOTHING_QUEUE_SORT", payload: { sort_by, order } });
    if (response.status === 200) {
      yield put({ type: "STOP_CLOTHING_QUEUE_LOADING" });
    }
  } catch (error) {
    yield put({ type: "STOP_CLOTHING_QUEUE_LOADING" });
    yield put({
      type: "SET_CLOTHING_QUEUE_ERROR",
      payload: { errorMessage: "Error getting clothing queue items", error },
    });
  }
}

function* updateClothingOrderedStatus(action) {
  const { idArray, boolean } = action.payload;

  try {
    yield put({ type: "START_CLOTHING_QUEUE_LOADING" });

    yield call(() =>
      axios.put(`/api/clothing-queue/items/update/ordered`, {
        idArray,
        bool: boolean,
      })
    );

    yield put({ type: "GET_CLOTHING_QUEUE_ITEMS" });
  } catch (error) {
    console.error("Error updating Ordered status", error);
    yield put({ type: "STOP_CLOTHING_QUEUE_LOADING" });
    yield put({
      type: "SET_CLOTHING_QUEUE_ERROR",
      payload: { errorMessage: "Error updating Ordered status", error },
    });
  }
}

function* deleteClothingQueueItem(action) {
  const ids = Array.isArray(action.payload) ? action.payload : [action.payload];

  try {
    yield put({ type: "START_CLOTHING_QUEUE_LOADING" });

    const promises = ids.map((id) => {
      return axios.delete(`/api/clothing-queue/item/delete/${id}`);
    });

    // Resolve all promises
    yield Promise.all(promises);

    yield put({ type: "GET_CLOTHING_QUEUE_ITEMS" });
    yield put({ type: "STOP_CLOTHING_QUEUE_LOADING" });
  } catch (error) {
    yield put({ type: "STOP_CLOTHING_QUEUE_LOADING" });
    yield put({
      type: "SET_CLOTHING_QUEUE_ERROR",
      payload: { errorMessage: "Error deleting queue item", error },
    });
  }
}

function* decoQueueSaga() {
  yield takeLatest("GET_CLOTHING_QUEUE_ITEMS", getClothingQueueItems);
  yield takeLatest(
    "UPDATE_CLOTHING_QUEUE_ORDER_STATUS",
    updateClothingOrderedStatus
  );
  yield takeLatest("DELETE_CLOTHING_QUEUE_ITEM", deleteClothingQueueItem);
}

export default decoQueueSaga;
