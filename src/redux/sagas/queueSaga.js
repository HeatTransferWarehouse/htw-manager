import { put, takeLatest } from "redux-saga/effects";
import axios from "axios";

function* getQueueItems(action) {
  const { sort_by, order } = action.payload || {
    sort_by: "created_at",
    order: "desc",
  };
  try {
    const response = yield axios.get(
      `/api/queue/item-queue/get?sort_by=${sort_by}&order=${order}`
    );
    yield put({ type: "SET_DECO_QUEUE_ITEMS", payload: response.data });
    yield put({ type: "SET_DECO_QUEUE_SORT", payload: { sort_by, order } });
    if (response.status === 200) {
      yield put({ type: "STOP_DECO_LOADING" });
    }
  } catch (error) {
    console.log("Error with getting queue items:", error);
    yield put({ type: "STOP_DECO_LOADING" });
  }
}

// function* startQueueItem(action) {
//   const ids = Array.isArray(action.payload) ? action.payload : [action.payload];

export function* startQueueItem(action) {
  const ids = Array.isArray(action.payload) ? action.payload : [action.payload];

  try {
    yield put({ type: "START_DECO_LOADING" });

    const promises = ids.map((id) => {
      return axios.put(`/api/queue/item-queue/start/progress/${id}`);
    });

    // Resolve all promises
    yield Promise.all(promises);

    yield put({ type: "GET_DECO_QUEUE_ITEMS" });
  } catch (error) {
    console.error("Error with starting queue item:", error);
  }
}

function* sendBackProgressQueueItem(action) {
  const ids = Array.isArray(action.payload) ? action.payload : [action.payload];

  try {
    yield put({ type: "START_DECO_LOADING" });

    const promises = ids.map((id) => {
      return axios.put(`/api/queue/item-queue/send-back/progress/${id}`);
    });

    // Resolve all promises
    yield Promise.all(promises);

    yield put({ type: "GET_DECO_QUEUE_ITEMS" });
  } catch (error) {
    console.error("Error with starting queue item:", error);
  }
}

function* completeQueueItem(action) {
  const ids = Array.isArray(action.payload) ? action.payload : [action.payload];

  try {
    yield put({ type: "START_DECO_LOADING" });

    const promises = ids.map((id) => {
      return axios.put(`/api/queue/item-queue/complete/${id}`);
    });

    // Resolve all promises
    yield Promise.all(promises);

    yield put({ type: "GET_DECO_QUEUE_ITEMS" });
  } catch (error) {
    console.error("Error with starting queue item:", error);
  }
}

function* sendBackCompletedQueueItem(action) {
  const ids = Array.isArray(action.payload) ? action.payload : [action.payload];

  try {
    yield put({ type: "START_DECO_LOADING" });

    const promises = ids.map((id) => {
      return axios.put(`/api/queue/item-queue/send-back/complete/${id}`);
    });

    // Resolve all promises
    yield Promise.all(promises);

    yield put({ type: "GET_DECO_QUEUE_ITEMS" });
  } catch (error) {
    console.error("Error with starting queue item:", error);
  }
}

function* deleteQueueItem(action) {
  const ids = Array.isArray(action.payload) ? action.payload : [action.payload];

  try {
    yield put({ type: "START_DECO_LOADING" });

    const promises = ids.map((id) => {
      return axios.delete(`/api/queue/item-queue/delete/${id}`);
    });

    // Resolve all promises
    yield Promise.all(promises);

    yield put({ type: "GET_DECO_QUEUE_ITEMS" });
  } catch (error) {
    console.error("Error with starting queue item:", error);
  }
}

function* updateQueueItemPriority(action) {
  const { id, priority } = action.payload;

  try {
    yield put({ type: "START_DECO_LOADING" });
    yield axios.put(`/api/queue/item-queue/update/priority/${id}`, {
      priority,
    });
    yield put({ type: "GET_DECO_QUEUE_ITEMS" });
  } catch (error) {
    console.log("Error with updating queue item priority:", error);
  }
}

function* decoQueueSaga() {
  yield takeLatest("GET_DECO_QUEUE_ITEMS", getQueueItems);
  yield takeLatest("START_DECO_QUEUE_ITEM", startQueueItem);
  yield takeLatest(
    "SEND_BACK_PROGRESS_DECO_QUEUE_ITEM",
    sendBackProgressQueueItem
  );
  yield takeLatest(
    "SEND_BACK_COMPLETED_DECO_QUEUE_ITEM",
    sendBackCompletedQueueItem
  );
  yield takeLatest("COMPLETE_DECO_QUEUE_ITEM", completeQueueItem);
  yield takeLatest("DELETE_DECO_QUEUE_ITEM", deleteQueueItem);
  yield takeLatest("UPDATE_DECO_QUEUE_ITEM_PRIORITY", updateQueueItemPriority);
}

export default decoQueueSaga;
