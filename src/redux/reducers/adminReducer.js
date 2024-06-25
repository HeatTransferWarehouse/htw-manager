import { combineReducers } from "redux";

function webhooks(state = [], action) {
  switch (action.type) {
    case "SET_WEBHOOKS":
      return action.payload;
    default:
      return state;
  }
}

export default combineReducers({
  webhooks,
});
