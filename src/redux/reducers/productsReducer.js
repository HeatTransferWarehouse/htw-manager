import { combineReducers } from "redux";

function productsNoDesc(state = [], action) {
  switch (action.type) {
    case "SET_PRODUCTS_NO_DESC":
      return action.payload;
    default:
      return state;
  }
}

function productsSyncing(state = false, action) {
  switch (action.type) {
    case "SYNC_PRODUCTS_LOADING":
      return true;
    case "SYNC_PRODUCTS_FINISHED":
      return false;
    default:
      return state;
  }
}

function lastSync(state = {}, action) {
  switch (action.type) {
    case "SET_LAST_SYNC_DATA":
      return action.payload;
    default:
      return state;
  }
}

function syncStatus(state = {}, action) {
  switch (action.type) {
    case "SET_SYNC_STATUS":
      return action.payload;
    default:
      return state;
  }
}

function sffProductsNoDesc(state = [], action) {
  switch (action.type) {
    case "SET_SFF_PRODUCTS_NO_DESC":
      return action.payload;
    default:
      return state;
  }
}

function lastSffSync(state = {}, action) {
  switch (action.type) {
    case "SET_SFF_LAST_SYNC_DATA":
      return action.payload;
    default:
      return state;
  }
}

function sffSyncStatus(state = {}, action) {
  switch (action.type) {
    case "SET_SFF_SYNC_STATUS":
      return action.payload;
    default:
      return state;
  }
}

export default combineReducers({
  productsNoDesc,
  productsSyncing,
  lastSync,
  lastSffSync,
  sffProductsNoDesc,
  sffSyncStatus,
  syncStatus,
});
