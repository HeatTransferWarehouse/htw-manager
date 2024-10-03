import { combineReducers } from "redux";

function promotionsLoader(state = false, action) {
  switch (action.type) {
    case "START_PROMOTIONS_LOADING":
      return true;
    case "STOP_PROMOTIONS_LOADING":
      return false;
    default:
      return state;
  }
}

function promotionsErrors(state = [], action) {
  switch (action.type) {
    case "SET_PROMOTIONS_ERROR":
      return action.payload;
    case "CLEAR_PROMOTIONS_ERROR":
      return [];
    default:
      return state;
  }
}

function promotionsStorage(state = [], action) {
  switch (action.type) {
    case "SET_PROMOTIONS":
      return action.payload;
    default:
      return state;
  }
}

function promotionLoader(state = false, action) {
  switch (action.type) {
    case "START_PROMOTION_LOADING":
      return true;
    case "STOP_PROMOTION_LOADING":
      return false;
    default:
      return state;
  }
}

function promotionErrors(state = [], action) {
  switch (action.type) {
    case "SET_PROMOTION_ERROR":
      return action.payload;
    case "CLEAR_PROMOTION_ERROR":
      return [];
    default:
      return state;
  }
}

function promotionStorage(state = {}, action) {
  switch (action.type) {
    case "SET_PROMOTION":
      return action.payload;
    default:
      return state;
  }
}

export default combineReducers({
  promotionsStorage,
  promotionsLoader,
  promotionsErrors,
  promotionStorage,
  promotionLoader,
  promotionErrors,
});
