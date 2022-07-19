import { combineReducers } from "redux";

const itemlist = (state = [], action) => {
  switch (action.type) {
    case "SET_ITEM":
      return action.payload;
    default:
      return state;
  }
};

const sanmarlist = (state = [], action) => {
  switch (action.type) {
    case "SET_SANMAR_ITEMS":
      return action.payload;
    default:
      return state;
  }
};

const clothingtemplist = (state = [], action) => {
  switch (action.type) {
    case "SET_CLOTHING":
      return [...state, ...action.payload.products];
    case "RESET_CLOTHING":
      return [];
    default:
      return state;
  }
};

const clothinglist = (state = [], action) => {
  switch (action.type) {
    case "SET_SANMAR_CLOTHING":
      return action.payload;
    case "RESET_SANMAR_CLOTHING":
      return [];
    default:
      return state;
  }
};

const bcClothinglist = (state = [], action) => {
  switch (action.type) {
    case "SET_BC_CLOTHING":
      return action.payload;
    case "RESET_BC_CLOTHING":
      return [];
    default:
      return state;
  }
};

const sanmar = (state = 'WAIT', action) => {
  switch (action.type) {
    case "SET_SANMAR":
      return action.payload;
    case "RESET_SANMAR":
      return '';
    default:
      return state;
  }
};

const tracking = (state = [], action) => {
  switch (action.type) {
    case "UPDATE_TRACKING":
      return action.payload;
    case "RESET_TRACKING":
      return [];
    default:
      return state;
  }
};

const supacolor = (state = [], action) => {
  switch (action.type) {
    case "SET_SUPACOLOR_ORDER":
      return action.payload;
    case "RESET_SUPACOLOR_ORDER":
      return [];
    default:
      return state;
  }
};

export default combineReducers({
  itemlist,
  sanmarlist,
  clothinglist,
  bcClothinglist,
  sanmar,
  tracking,
  clothingtemplist,
  supacolor,
});