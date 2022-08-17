import { combineReducers } from "redux";

const itemlist = (state = [], action) => {
  switch (action.type) {
    case "SET_ITEM":
      return action.payload;
    default:
      return state;
  }
};

const historylist = (state = [], action) => {
  switch (action.type) {
    case "SET_HISTORY":
      return action.payload;
    default:
      return state;
  }
};

const historylisttable = (state = [], action) => {
  switch (action.type) {
    case "SET_HISTORY_TABLE":
      return action.payload;
    default:
      return state;
  }
};

const customitemlist = (state = [], action) => {
  switch (action.type) {
    case "SET_CUSTOM_ITEM":
      return action.payload;
    default:
      return state;
  }
};

const itemlistcount = (state = [], action) => {
  switch (action.type) {
    case "SET_ITEM_COUNT":
      return action.payload;
    default:
      return state;
  }
};

const customitemlistcount = (state = [], action) => {
  switch (action.type) {
    case "SET_CUSTOM_ITEM_COUNT":
      return action.payload;
    default:
      return state;
  }
};
const progresslist = (state = [], action) => {
  switch (action.type) {
    case "SET_PROGRESS":
      return action.payload;
    default:
      return state;
  }
};

const progresslistcount = (state = [], action) => {
  switch (action.type) {
    case "SET_PROGRESS_COUNT":
      return action.payload;
    default:
      return state;
  }
};

const confirmlist = (state = [], action) => {
  switch (action.type) {
    case "SET_CONFIRM":
      return action.payload;
    default:
      return state;
  }
};

const confirmlistcount = (state = [], action) => {
  switch (action.type) {
    case "SET_CONFIRM_COUNT":
      return action.payload;
    default:
      return state;
  }
};

const respondlist = (state = [], action) => {
  switch (action.type) {
    case "SET_RESPOND":
      return action.payload;
    default:
      return state;
  }
};

const respondlistcount = (state = [], action) => {
  switch (action.type) {
    case "SET_RESPOND_COUNT":
      return action.payload;
    default:
      return state;
  }
};

const approvelist = (state = [], action) => {
  switch (action.type) {
    case "SET_APPROVE":
      return action.payload;
    default:
      return state;
  }
};

const approvelistcount = (state = [], action) => {
  switch (action.type) {
    case "SET_APPROVE_COUNT":
      return action.payload;
    default:
      return state;
  }
};

const completelist = (state = [], action) => {
  switch (action.type) {
    case "SET_COMPLETE":
      return action.payload;
    default:
      return state;
  }
};

const customcompletelist = (state = [], action) => {
  switch (action.type) {
    case "SET_CUSTOM_COMPLETE":
      return action.payload;
    default:
      return state;
  }
};

const completelistcount = (state = [], action) => {
  switch (action.type) {
    case "SET_COMPLETE_COUNT":
      return action.payload;
    default:
      return state;
  }
};

const customcompletelistcount = (state = [], action) => {
  switch (action.type) {
    case "SET_CUSTOM_COMPLETE_COUNT":
      return action.payload;
    default:
      return state;
  }
};

const replieslist = (state = [], action) => {
  switch (action.type) {
    case "SET_REPLIES":
      return action.payload;
    default:
      return state;
  }
};

const detailslist = (state = [], action) => {
  switch (action.type) {
    case "SET_DETAILS":
      return action.payload;
    default:
      return state;
  }
};

const orderlist = (state = [], action) => {
  switch (action.type) {
    case "SET_ORDER":
      return action.payload;
    default:
      return state;
  }
};

const shippinglist = (state = [], action) => {
  switch (action.type) {
    case "SET_SHIPPING":
      return action.payload;
    default:
      return state;
  }
};

const productlist = (state = [], action) => {
  switch (action.type) {
    case "SET_PRODUCT":
      return action.payload;
    default:
      return state;
  }
};


export default combineReducers({
  itemlist,
  historylist,
  historylisttable,
  customitemlist,
  itemlistcount,
  customitemlistcount,
  progresslist,
  progresslistcount,
  confirmlist,
  confirmlistcount,
  respondlist,
  respondlistcount,
  approvelist,
  approvelistcount,
  completelist,
  completelistcount,
  customcompletelist,
  customcompletelistcount,
  replieslist,
  detailslist,
  orderlist,
  shippinglist,
  productlist,
});