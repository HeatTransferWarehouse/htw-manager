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

function* adminSaga() {
  yield takeLatest("GET_WEBHOOKS", getWebhooks);
  yield takeLatest("CREATE_WEBHOOK", createWebhook);
}

export default adminSaga;
