import { combineReducers } from "redux";

function queueItems(state = [], action) {
  switch (action.type) {
    case "SET_QUEUE_ITEMS":
      return action.payload;
    default:
      return state;
  }
}

export default combineReducers({
  queueItems,
});
