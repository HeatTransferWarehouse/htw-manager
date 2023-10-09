import { put, takeLatest, call } from "redux-saga/effects";
import axios from "axios";

function* captureOrders(action) {
  try {
    yield axios.post(`/api/capture`, action.payload);
  } catch (error) {
    console.log("Error with capturing orders:", error);
  }
}

function* getitemlist(action) {
  try {
    const response = yield axios.get(`/api/item/getitems`);
    yield put({
      type: "SET_ITEM",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getsanmarlist(action) {
  try {
    const response = yield axios.get(`/api/item/getsanmar`);
    yield put({
      type: "SET_SANMAR_ITEMS",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* addItem(action) {
  try {
    yield axios.post(`/api/item/items`, action.payload);
    const response = yield axios.get(`/api/item/getitems`);
    yield put({
      type: "SET_ITEM",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with adding to the list of items:", error);
  }
}

function* deleteItem(action) {
  try {
    yield axios.delete(`/api/item/items:${action.payload.id}`);
    const response = yield axios.get(`/api/item/getitems`);
    yield put({
      type: "SET_ITEM",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with deleting from the list of items:", error);
  }
}

function* resetData(action) {
  try {
    yield axios.delete(`/api/item/all`);
    const response = yield axios.get(`/api/item/getitems`);
    yield put({
      type: "SET_ITEM",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with deleting from the list of items:", error);
  }
}

function* updatePrices(action) {
  try {
    yield axios.put(`/api/item/updatePrices`, action.payload);
  } catch (error) {
    console.log("Error with updating prices:", error);
  }
}

function* connectFtp(action) {
  try {
    const response = yield axios.put(`/api/item/ftp`, action.payload);
    if (response.data.status === 500) {
      yield put({
        type: "SET_SANMAR",
        payload: "NO",
      });
    } else {
      yield put({
        type: "SET_SANMAR",
        payload: response.data,
      });
    }
  } catch (error) {
    console.log("Error with connecting ftp:", error);
  }
}

function* sendEmail(action) {
  try {
    const response = yield axios.post(`/api/item/addOrder`, action.payload);
    yield put({
      type: "SET_SANMAR_ITEMS",
      payload: response.data,
    });
    yield axios.put(`/api/item/email`, action.payload);
  } catch (error) {
    console.log("Error with sending email:", error);
  }
}

function* addSent(action) {
  try {
    const response = yield axios.post(`/api/item/addOrder`, action.payload);
    yield put({
      type: "SET_SANMAR_ITEMS",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with adding order:", error);
  }
}

function* refreshBC() {
  try {
    yield axios.get(`/api/item/refreshBC`);
    const response = yield axios.get(`/api/item/getBC`);
    yield put({
      type: "SET_BC_CLOTHING",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with refreshing bc:", error);
  }
}

function* refreshSanmar(action) {
  try {
    yield axios.post(`/api/item/sanmarDB`, action.payload);
    const response = yield axios.get(`/api/item/getSanmarPrices`);
    yield put({
      type: "SET_SANMAR_CLOTHING",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with refreshing sanmar:", error);
  }
}

function* getBcPrices() {
  try {
    const response = yield axios.get(`/api/item/getBC`);
    yield put({
      type: "SET_BC_CLOTHING",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting bc prices:", error);
  }
}

function* getSanmarPrices() {
  try {
    const response = yield axios.get(`/api/item/getSanmarPrices`);
    yield put({
      type: "SET_SANMAR_CLOTHING",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting sanmar prices:", error);
  }
}

function uploadArtwork(formData, jobId) {
  return axios.post(`/supacolor-api/upload-artwork/${jobId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

function* uploadArtworkSaga(action) {
  try {
    yield put({ type: "UPLOAD_ARTWORK_REQUEST" });

    const response = yield call(
      uploadArtwork,
      action.payload.data,
      action.payload.id
    );
    yield put({ type: "UPLOAD_ARTWORK_SUCCESS", payload: response.data });
  } catch (error) {
    yield put({ type: "UPLOAD_ARTWORK_FAILURE", payload: error.message });
  }
}

function* getJobDetails(action) {
  try {
    yield put({ type: "REQUEST_JOB_DETAILS" });
    const response = yield axios.get(
      `/supacolor-api/get-job-details/${action.payload}`
    );
    yield put({ type: "SET_JOB_DETAIL", payload: response.data });
    yield put({ type: "JOB_DETAILS_SUCCESS" });
  } catch (error) {
    console.log("Error Getting Job Details", error);
  }
}

function* getJobsList() {
  try {
    const response = yield axios.get("/supacolor-api/get-jobs");
    yield put({ type: "GET_JOBS_LIST", payload: response.data });
  } catch (error) {
    console.log("Failed to get Jobs List");
  }
}

function* fakeDeleteJobs(action) {
  try {
    yield axios.put("/supacolor-api/fake-delete-job", action.payload);
    yield put({ type: "FETCH_JOBS_LIST" });
  } catch (error) {
    console.log("Error Fake Deleting Jobs", error);
  }
}

function* recoverDeletedJobs(action) {
  try {
    yield axios.put("/supacolor-api/recover-deleted-job", action.payload);
    yield put({ type: "FETCH_JOBS_LIST" });
  } catch (err) {
    console.log("Error Recovering Deleted Jobs", err);
  }
}

//this takes all of the Saga functions and dispatches them
function* itemSaga() {
  yield takeLatest("GET_ITEM_LIST", getitemlist);
  yield takeLatest("REFRESH_BC", refreshBC);
  yield takeLatest("REFRESH_SANMAR", refreshSanmar);
  yield takeLatest("GET_SANMAR_LIST", getsanmarlist);
  yield takeLatest("ADD_ITEM", addItem);
  yield takeLatest("DELETE_ITEM", deleteItem);
  yield takeLatest("CAPTURE_ORDERS", captureOrders);
  yield takeLatest("RESET_DATA", resetData);
  yield takeLatest("UPDATE_PRICES", updatePrices);
  yield takeLatest("CONNECT_FTP", connectFtp);
  yield takeLatest("SEND_EMAIL", sendEmail);
  yield takeLatest("ADD_SENT", addSent);
  yield takeLatest("GET_SANMAR_PRICES", getSanmarPrices);
  yield takeLatest("GET_BC_PRICES", getBcPrices);
  yield takeLatest("UPLOAD_ARTWORK", uploadArtworkSaga);
  yield takeLatest("GET_JOB_DETAILS", getJobDetails);
  yield takeLatest("FETCH_JOBS_LIST", getJobsList);
  yield takeLatest("FAKE_DELETE_JOB", fakeDeleteJobs);
  yield takeLatest("RECOVER_DELETED_JOB", recoverDeletedJobs);
}

export default itemSaga;
