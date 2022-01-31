import { combineReducers } from "redux";

const itemlist = (state = [], action) => {
  switch (action.type) {
    case "SET_ITEM":
      return action.payload;
    default:
      return state;
  }
};

const clothinglist = (state = [], action) => {
  switch (action.type) {
    case "SET_CLOTHING":
      return [...state, ...action.payload.products];
    case "RESET_CLOTHING":
      return [];
    default:
      return state;
  }
};

const bcClothinglist = (state = [], action) => {
  switch (action.type) {
    case "SET_CLOTHING":
      return [...state, ...action.payload.products];
    case "RESET_CLOTHING":
      return [];
    default:
      return state;
  }
};

export default combineReducers({
  itemlist,
  clothinglist,
  bcClothinglist,
});