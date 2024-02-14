import axios from "axios";
import { put, takeLatest } from "redux-saga/effects";

// worker Saga: will be fired on "FETCH_USER" actions
function* fetchUser() {
  try {
    const config = {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    };

    // the config includes credentials which
    // allow the server session to recognize the user
    // If a user is logged in, this will return their information
    // from the server session (req.user)
    const response = yield axios.get("/api/user", config);

    // now that the session has given us a user object
    // with an id and username set the client-side user object to let
    // the client-side code know the user is logged in
    yield put({ type: "SET_USER", payload: response.data });
  } catch (error) {
    console.log("User get request failed", error);
  }
}

function* fetchAllUsers() {
  try {
    const response = yield axios.get("/api/user/all");
    yield put({ type: "SET_ALL_USERS", payload: response.data });
  } catch (error) {
    console.log("User get request failed", error);
  }
}

function* deleteUser(action) {
  try {
    yield axios.delete(`/api/user/${action.payload}`);
    yield put({ type: "FETCH_ALL_USERS" });
  } catch (error) {
    console.log("User delete request failed", error);
  }
}

function* updateUser(action) {
  try {
    yield axios.put(`/api/user/update/${action.payload.id}`, action.payload);
    yield put({ type: "FETCH_ALL_USERS" });
  } catch (error) {
    console.log("User update request failed", error);
  }
}

function* userSaga() {
  yield takeLatest("FETCH_USER", fetchUser);
  yield takeLatest("FETCH_ALL_USERS", fetchAllUsers);
  yield takeLatest("DELETE_USER", deleteUser);
  yield takeLatest("UPDATE_USER", updateUser);
}

export default userSaga;
