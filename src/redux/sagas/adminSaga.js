import { put, takeLatest } from "redux-saga/effects";
import axios from "axios";

function* getWebhooks(action) {
  try {
    const response = yield axios.get(`/api/admin/get/webhooks`);
    yield put({ type: "SET_WEBHOOKS", payload: response.data });
  } catch (err) {
    console.log("Error in get Webhooks Saga", err);
  }
}

function* createWebhook(action) {
  try {
    yield axios.post(`/api/admin/create/webhook`, action.payload);
    yield put({ type: "GET_WEBHOOKS" });
  } catch (err) {
    console.log("Error in create Webhook Saga", err);
  }
}

function* updateWebhook(action) {
  try {
    yield axios.put(
      `/api/admin/update/webhook/${action.payload.id}`,
      action.payload.webhook
    );
    yield put({ type: "GET_WEBHOOKS" });
  } catch (err) {
    console.log("Error in update Webhook Saga", err);
  }
}

function* deleteWebhook(action) {
  try {
    yield axios.delete(`/api/admin/delete/webhook/${action.payload}`);
    yield put({ type: "GET_WEBHOOKS" });
  } catch (err) {
    console.log("Error in delete Webhook Saga", err);
  }
}

function* adminSaga() {
  yield takeLatest("GET_WEBHOOKS", getWebhooks);
  yield takeLatest("CREATE_WEBHOOK", createWebhook);
  yield takeLatest("DELETE_WEBHOOK", deleteWebhook);
  yield takeLatest("UPDATE_WEBHOOK", updateWebhook);
}

export default adminSaga;
