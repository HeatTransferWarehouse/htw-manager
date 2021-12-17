import { combineReducers } from "redux";

const itemlist = (state = [], action) => {
  switch (action.type) {
    case "SET_ITEM":
      return action.payload;
    default:
      return state;
  }
};

const rowsList = (state = [], action) => {
  switch (action.type) {
    case "ADD_ROWS":
      return action.payload;
    default:
      return state;
  }
};

export default combineReducers({
  itemlist,
  rowsList,
});