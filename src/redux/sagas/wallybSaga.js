
import { put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';

function* wallyBHello(action) {
  try {

    yield axios.put(`/api/affiliate/wallyBMessages`, action.payload);

  } catch (error) {
    console.log("Error with sending Wally B Message: ", error);
  }
}


function* wallybSaga() {
    yield takeLatest('WALLY_B_HELLO', wallyBHello);
    yield takeLatest('WALLY_B_HI', wallyBHello);
    yield takeLatest('WALLY_B_NO', wallyBHello);
    yield takeLatest('WALLY_B_YES', wallyBHello);
    yield takeLatest('WALLY_B_MAYBE', wallyBHello);
    yield takeLatest('WALLY_B_NOT_ROBOT', wallyBHello);
    yield takeLatest('WALLY_B_KINDA', wallyBHello);
    yield takeLatest('WALLY_B_CUSTOM', wallyBHello);
}

export default wallybSaga;