import { combineReducers } from "redux";

const historylisttable = (state = [], action) => {
  switch (action.type) {
    case "SET_HISTORY_TABLE":
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

const completelist = (state = [], action) => {
  switch (action.type) {
    case "SET_COMPLETE_QUEUE":
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
      case "CLEAR_PRODUCT":
        return false;
    default:
      return state;
  }
};


export default combineReducers({
  historylisttable,
  itemlistcount,
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
  detailslist,
  orderlist,
  shippinglist,
  productlist,
});