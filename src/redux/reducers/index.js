import { combineReducers } from "redux";
import item from "./itemReducer";
import redirect from "./redirectReducer";
import error from "./errorsReducer";
import login from "./loginModeReducer";
import user from "./userReducer";
import queue from "./queueReducer";
import sffQueue from "./sffQueueReducer";
import loading from "./loadingReducer";
import decoQueueReducer from "./decoQueueReducer";

// rootReducer is the primary reducer for our entire project
// It bundles up all of the other reducers so our project can use them.
// This is imported in index.js as rootSaga

// Lets make a bigger object for our store, with the objects from our reducers.
// This is what we get when we use 'state' inside of 'mapStateToProps'
const rootReducer = combineReducers({
  item,
  redirect,
  error,
  login,
  user,
  queue,
  sffQueue,
  loading,
  decoQueueReducer,
});

export default rootReducer;
