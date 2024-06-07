import { put, takeLatest } from "redux-saga/effects";
import axios from "axios";

function* getQueueItems(action) {
  try {
    const response = yield axios.get(`/api/sff-queue/item-queue/get`);
    yield put({ type: "SET_QUEUE_ITEMS", payload: response.data });
  } catch (error) {
    console.log("Error with getting queue items:", error);
  }
}

function* startQueueItem(action) {
  const ids = Array.isArray(action.payload) ? action.payload : [action.payload];

  for (const id of ids) {
    try {
      yield axios.put(`/api/sff-queue/item-queue/start/progress/${id}`);
      yield put({ type: "GET_QUEUE_ITEMS" });
    } catch (error) {
      console.log("Error with sending back queue item:", error);
    }
  }
}

function* sendBackProgressQueueItem(action) {
  const ids = Array.isArray(action.payload) ? action.payload : [action.payload];

  for (const id of ids) {
    try {
      yield axios.put(`/api/sff-queue/item-queue/send-back/progress/${id}`);
      yield put({ type: "GET_QUEUE_ITEMS" });
    } catch (error) {
      console.log("Error with sending back queue item:", error);
    }
  }
}

function* completeQueueItem(action) {
  const ids = Array.isArray(action.payload) ? action.payload : [action.payload];

  for (const id of ids) {
    try {
      yield axios.put(`/api/sff-queue/item-queue/complete/${id}`);
      yield put({ type: "GET_QUEUE_ITEMS" });
    } catch (error) {
      console.log("Error with completing queue item:", error);
    }
  }
}

function* sendBackCompletedQueueItem(action) {
  const ids = Array.isArray(action.payload) ? action.payload : [action.payload];

  for (const id of ids) {
    try {
      yield axios.put(`/api/sff-queue/item-queue/send-back/complete/${id}`);
      yield put({ type: "GET_QUEUE_ITEMS" });
    } catch (error) {
      console.log("Error with sending back completed item:", error);
    }
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
}

export default queueItemSaga;
