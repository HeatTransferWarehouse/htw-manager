import { put, takeLatest, call, all, race, delay } from "redux-saga/effects";
import axios from "axios";

function* getClothingQueueItems(action) {
  const { sort_by, order } = action.payload || {
    sort_by: "date",
    order: "desc",
  };

  try {
    const { response } = yield race({
      response: call(
        axios.get,
        `/api/clothing-queue/items?sort_by=${sort_by}&order=${order}`
      ),
      loader: delay(300), // Delay loader by 300ms
    });

    if (!response) {
      yield put({ type: "START_CLOTHING_QUEUE_LOADING" });
      response = yield call(
        axios.get,
        `/api/clothing-queue/items?sort_by=${sort_by}&order=${order}`
      );
    }

    yield put({ type: "SET_CLOTHING_QUEUE_ITEMS", payload: response.data });
    yield put({ type: "SET_CLOTHING_QUEUE_SORT", payload: { sort_by, order } });
  } catch (error) {
    yield put({
      type: "SET_CLOTHING_QUEUE_ERROR",
      payload: { errorMessage: "Error getting clothing queue items", error },
    });
  } finally {
    yield put({ type: "STOP_CLOTHING_QUEUE_LOADING" });
  }
}

function* updateClothingOrderedStatus(action) {
  const { idArray, boolean } = action.payload;

  try {
    const { response } = yield race({
      response: call(axios.put, `/api/clothing-queue/items/ordered`, {
        idArray,
        bool: boolean,
      }), // ✅ Corrected call usage
      loader: delay(300), // Delay loader by 300ms
    });

    if (!response) {
      yield put({ type: "START_CLOTHING_QUEUE_LOADING" });
      response = yield call(axios.put, `/api/clothing-queue/items/ordered`, {
        idArray,
        bool: boolean,
      }); // ✅ Corrected here too
    }
    yield put({ type: "SET_CLOTHING_QUEUE_RESPONSE", payload: response.data });
  } catch (error) {
    console.error("Error updating Ordered status", error);
    yield put({
      type: "SET_CLOTHING_QUEUE_ERROR",
      payload: { errorMessage: "Error updating Ordered status", error },
    });
  } finally {
    yield put({ type: "GET_CLOTHING_QUEUE_ITEMS" });
    yield put({ type: "STOP_CLOTHING_QUEUE_LOADING" });
  }
}

function* deleteClothingQueueItem(action) {
  const ids = Array.isArray(action.payload) ? action.payload : [action.payload];

  try {
    const { response } = yield race({
      response: all(
        ids.map((id) => call(axios.delete, `/api/clothing-queue/items/${id}`))
      ),
      loader: delay(300), // Delay loader by 300ms
    });

    if (!response) {
      yield put({ type: "START_CLOTHING_QUEUE_LOADING" });
      response = yield all(
        ids.map((id) => call(axios.delete, `/api/clothing-queue/items/${id}`))
      );
    }

    yield put({
      type: "SET_CLOTHING_QUEUE_RESPONSE",
      payload: { status: 200, message: "Item(s) deleted successfully" },
    });
  } catch (error) {
    yield put({
      type: "SET_CLOTHING_QUEUE_RESPONSE",
      payload: { status: 400, message: error.message },
    });
  } finally {
    yield put({ type: "STOP_CLOTHING_QUEUE_LOADING" });
    yield put({ type: "GET_CLOTHING_QUEUE_ITEMS" });
  }
}

function* holdClothingQueueItem(action) {
  const idArray = Array.isArray(action.payload)
    ? action.payload
    : [action.payload];

  try {
    const { response } = yield race({
      response: call(axios.put, `/api/clothing-queue/items/hold`, { idArray }), // ✅ Corrected call
      loader: delay(300), // Delay loader by 300ms
    });

    if (!response) {
      yield put({ type: "START_CLOTHING_QUEUE_LOADING" });
      response = yield call(axios.put, `/api/clothing-queue/items/hold`, {
        idArray,
      }); // ✅ Corrected
    }

    yield put({ type: "SET_CLOTHING_QUEUE_RESPONSE", payload: response.data });
  } catch (error) {
    console.error("Error holding queue item", error);
  } finally {
    yield put({ type: "STOP_CLOTHING_QUEUE_LOADING" });
    yield put({ type: "GET_CLOTHING_QUEUE_ITEMS" });
  }
}

function* enterMissingOrder(action) {
  try {
    yield put({ type: "START_CLOTHING_QUEUE_LOADING" });
    const response = yield call(
      axios.post,
      `/api/clothing-queue/items/missing`,
      {
        orderId: action.payload,
      }
    );
    yield put({ type: "SET_CLOTHING_QUEUE_RESPONSE", payload: response.data });
  } catch (error) {
    console.error("Error entering missing order", error);
    yield put({
      type: "SET_CLOTHING_QUEUE_RESPONSE",
      payload: {
        status: 500,
        message: `Error entering missing order ${error.message}`,
      },
    });
  } finally {
    yield put({ type: "STOP_CLOTHING_QUEUE_LOADING" });
    yield put({ type: "GET_CLOTHING_QUEUE_ITEMS" });
  }
}

function* decoQueueSaga() {
  yield takeLatest("GET_CLOTHING_QUEUE_ITEMS", getClothingQueueItems);
  yield takeLatest(
    "UPDATE_CLOTHING_QUEUE_ORDER_STATUS",
    updateClothingOrderedStatus
  );
  yield takeLatest("DELETE_CLOTHING_QUEUE_ITEM", deleteClothingQueueItem);
  yield takeLatest("HOLD_CLOTHING_QUEUE_ITEM", holdClothingQueueItem);
  yield takeLatest("ENTER_MISSING_CLOTHING_QUEUE_ITEM", enterMissingOrder);
}

export default decoQueueSaga;
