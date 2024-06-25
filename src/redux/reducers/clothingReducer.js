import { combineReducers } from "redux";

function clothingQueueItems(state = [], action) {
  switch (action.type) {
    case "SET_CLOTHING_QUEUE_ITEMS":
      return action.payload;
    default:
      return state;
  }
}

function clothingQueueSort(state = {}, action) {
  switch (action.type) {
    case "SET_CLOTHING_QUEUE_SORT":
      return action.payload;
    default:
      return state;
  }
}

function clothingQueueLoading(state = false, action) {
  switch (action.type) {
    case "START_CLOTHING_QUEUE_LOADING":
      return true;
    case "STOP_CLOTHING_QUEUE_LOADING":
      return false;
    default:
      return state;
  }
}

function clothingQueueErrors(state = [], action) {
  switch (action.type) {
    case "SET_CLOTHING_QUEUE_ERROR":
      return action.payload;
    default:
      return state;
  }
}

export default combineReducers({
  items: clothingQueueItems,
  sort: clothingQueueSort,
  loading: clothingQueueLoading,
  error: clothingQueueErrors,
});
