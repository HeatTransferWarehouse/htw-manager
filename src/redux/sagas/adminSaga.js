import { put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';

function* getWebhooks() {
  try {
    const response = yield axios.get(`/api/admin/get/webhooks`);
    yield put({ type: 'SET_WEBHOOKS', payload: response.data });
  } catch (err) {
    console.log('Error in get Webhooks Saga', err);
  }
}

function* createWebhook(action) {
  const { storeKey, webhook } = action.payload;
  try {
    yield axios.post(`/api/admin/create/webhook`, { data: { storeKey, webhook } });
    yield put({ type: 'GET_WEBHOOKS' });
  } catch (err) {
    console.log('Error in create Webhook Saga', err);
  }
}

function* updateWebhook(action) {
  const { storeKey, id, webhook } = action.payload;
  try {
    yield axios.put(`/api/admin/update/webhook/${id}`, { data: { storeKey, webhook } });
    yield put({ type: 'GET_WEBHOOKS' });
  } catch (err) {
    console.log('Error in update Webhook Saga', err);
  }
}

function* deleteWebhook(action) {
  try {
    const { storeKey, id } = action.payload;
    yield axios.delete(`/api/admin/delete/webhook/${id}`, { data: { storeKey } });
    yield put({ type: 'GET_WEBHOOKS' });
  } catch (err) {
    console.log('Error in delete Webhook Saga', err);
  }
}

function* adminSaga() {
  yield takeLatest('GET_WEBHOOKS', getWebhooks);
  yield takeLatest('CREATE_WEBHOOK', createWebhook);
  yield takeLatest('DELETE_WEBHOOK', deleteWebhook);
  yield takeLatest('UPDATE_WEBHOOK', updateWebhook);
}

export default adminSaga;
