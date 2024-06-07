import { all } from "redux-saga/effects";
import ItemSaga from "./ItemSaga";
import LoginSaga from "./loginSaga";
import RegisterSaga from "./registrationSaga";
import UserSaga from "./userSaga";
import QueueItemSaga from "./QueueItemSaga";
import SffQueueSaga from "./sffQueueSaga";

// rootSaga is the primary saga.
// It bundles up all of the other sagas so our project can use them.
// This is imported in index.js as rootSaga
export default function* rootSaga() {
  yield all([
    ItemSaga(),
    LoginSaga(),
    RegisterSaga(),
    UserSaga(),
    QueueItemSaga(),
    SffQueueSaga(),
  ]);
}
