import { put, takeLatest } from "redux-saga/effects";
import axios from "axios";

function* getPromotions(action) {
  const page = action.payload.page ?? 1;
  const direction = action.payload.direction ?? "desc";
  const status = action.payload.status ?? "enabled";
  const limit = action.payload.limit ?? 25;
  const sort = action.payload.sort ?? "id";

  try {
    yield put({ type: "START_PROMOTIONS_LOADING" });
    const response = yield axios.get(
      `/api/promotions/?page=${page}&direction=${direction}&status=${status}&limit=${limit}&sort=${sort}`
    );
    yield put({ type: "SET_PROMOTIONS", payload: response.data });
    yield put({ type: "STOP_PROMOTIONS_LOADING" });
  } catch (error) {
    yield put({ type: "SET_PROMOTIONS_ERROR", payload: error });
    yield put({ type: "STOP_PROMOTIONS_LOADING" });
  }
}

function* getPromotion(action) {
  const id = action.payload.id;

  try {
    yield put({ type: "START_PROMOTION_LOADING" });
    const response = yield axios.get(`/api/promotions/${id}`);
    yield put({ type: "SET_PROMOTION", payload: response.data });
    yield put({ type: "STOP_PROMOTION_LOADING" });
  } catch (error) {
    yield put({ type: "SET_PROMOTION_ERROR", payload: error });
    yield put({ type: "STOP_PROMOTION_LOADING" });
  }
}

function* promotionsSaga() {
  yield takeLatest("FETCH_PROMOTIONS", getPromotions);
  yield takeLatest("FETCH_PROMOTION", getPromotion);
}

export default promotionsSaga;
