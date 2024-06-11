import { put, takeLatest } from "redux-saga/effects";
import axios from "axios";

function* getQueueItems(action) {
  const { sort_by, order } = action.payload || {};
  try {
    const response = yield axios.get(
      `/api/sff-queue/item-queue/get?sort_by=${sort_by}&order=${order}`
    );
    yield put({ type: "SET_QUEUE_ITEMS", payload: response.data });
    yield put({ type: "SET_QUEUE_SORT", payload: { sort_by, order } });
    console.log("Queue items:", response.status);
    if (response.status === 200) {
      yield put({ type: "STOP_LOADING" });
    }
  } catch (error) {
    console.log("Error with getting queue items:", error);
    yield put({ type: "STOP_LOADING" });
  }
}

// function* startQueueItem(action) {
//   const ids = Array.isArray(action.payload) ? action.payload : [action.payload];

export function* startQueueItem(action) {
  const ids = Array.isArray(action.payload) ? action.payload : [action.payload];

  try {
    yield put({ type: "START_LOADING" });

    const promises = ids.map((id) => {
      return axios.put(`/api/sff-queue/item-queue/start/progress/${id}`);
    });

    // Resolve all promises
    yield Promise.all(promises);

    yield put({ type: "GET_QUEUE_ITEMS" });
  } catch (error) {
    console.error("Error with starting queue item:", error);
  }
}

function* sendBackProgressQueueItem(action) {
  const ids = Array.isArray(action.payload) ? action.payload : [action.payload];

  try {
    yield put({ type: "START_LOADING" });

    const promises = ids.map((id) => {
      return axios.put(`/api/sff-queue/item-queue/send-back/progress/${id}`);
    });

    // Resolve all promises
    yield Promise.all(promises);

    yield put({ type: "GET_QUEUE_ITEMS" });
  } catch (error) {
    console.error("Error with starting queue item:", error);
  }
}

function* completeQueueItem(action) {
  const ids = Array.isArray(action.payload) ? action.payload : [action.payload];

  try {
    yield put({ type: "START_LOADING" });

    const promises = ids.map((id) => {
      return axios.put(`/api/sff-queue/item-queue/complete/${id}`);
    });

    // Resolve all promises
    yield Promise.all(promises);

    yield put({ type: "GET_QUEUE_ITEMS" });
  } catch (error) {
    console.error("Error with starting queue item:", error);
  }
}

function* sendBackCompletedQueueItem(action) {
  const ids = Array.isArray(action.payload) ? action.payload : [action.payload];

  try {
    yield put({ type: "START_LOADING" });

    const promises = ids.map((id) => {
      return axios.put(`/api/sff-queue/item-queue/send-back/complete/${id}`);
    });

    // Resolve all promises
    yield Promise.all(promises);

    yield put({ type: "GET_QUEUE_ITEMS" });
  } catch (error) {
    console.error("Error with starting queue item:", error);
  }
}

function* deleteQueueItem(action) {
  const ids = Array.isArray(action.payload) ? action.payload : [action.payload];

  try {
    yield put({ type: "START_LOADING" });

    const promises = ids.map((id) => {
      return axios.delete(`/api/sff-queue/item-queue/delete/${id}`);
    });

    // Resolve all promises
    yield Promise.all(promises);

    yield put({ type: "GET_QUEUE_ITEMS" });
  } catch (error) {
    console.error("Error with starting queue item:", error);
  }
}

function* updateQueueItemPriority(action) {
  const { id, priority } = action.payload;

  try {
    yield put({ type: "START_LOADING" });
    yield axios.put(`/api/sff-queue/item-queue/update/priority/${id}`, {
      priority,
    });
    yield put({ type: "GET_QUEUE_ITEMS" });
  } catch (error) {
    console.log("Error with updating queue item priority:", error);
  }
}

function* queueItemSaga() {
  yield takeLatest("GET_QUEUE_ITEMS", getQueueItems);
  yield takeLatest("START_QUEUE_ITEM", startQueueItem);
  yield takeLatest("SEND_BACK_PROGRESS_QUEUE_ITEM", sendBackProgressQueueItem);
  yield takeLatest(
    "SEND_BACK_COMPLETED_QUEUE_ITEM",
    sendBackCompletedQueueItem
  );
  yield takeLatest("COMPLETE_QUEUE_ITEM", completeQueueItem);
  yield takeLatest("DELETE_QUEUE_ITEM", deleteQueueItem);
  yield takeLatest("UPDATE_QUEUE_ITEM_PRIORITY", updateQueueItemPriority);
}

export default queueItemSaga;
