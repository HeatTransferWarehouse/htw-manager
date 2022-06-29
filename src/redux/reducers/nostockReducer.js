import { combineReducers } from "redux";

const itemlist = (state = [], action) => {
  switch (action.type) {
    case "SET_NO_STOCK":
      return action.payload;
    default:
      return state;
  }
};

const displayState = (state = true, action) => {
  switch (action.type) {
    case "SET_UPDATING":
      return false;
    case "SET_DONE":
      return true;
    default:
      return state;
  }
};

const setView = (state = true, action) => {
  switch (action.type) {
    case "SET_VIEW":
      return action.payload;
    default:
      return state;
  }
};

const setChecked = (state = true, action) => {
  switch (action.type) {
    case "SET_CHECKED":
      if (action.payload === true) {
        return false;
      } else {
      return true;
      }
    default:
      return state;
  }
};

const addChecked = (state = [], action) => {
  switch (action.type) {
    case "ADD_TO_CHECKED":
      if (action.payload.checked) {
      return [...state, action.payload.item];
      } else {
        let spot = state.indexOf(action.payload.item);

      return state.slice(0, spot)
          .concat(state.slice(spot + 1));
      }
    case "CLEAR_CHECKED":
      return [];
    default:
      return state;
  }
};

const trackChecked = (state = [], action) => {
  switch (action.type) {
    case "ADD_TO_TRACKED":
      if (action.payload.checked) {
        return [...state, action.payload.data];
      } else {
        let spot = state.indexOf(action.payload.data);
        return state.slice(0, spot)
          .concat(state.slice(spot + 1));
      }
      case "CLEAR_TRACKING":
        return [];
      default:
        return state;
  }
};


export default combineReducers({
  itemlist,
  displayState,
  setView,
  setChecked,
  addChecked,
  trackChecked,
});