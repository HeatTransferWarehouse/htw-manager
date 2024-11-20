import { combineReducers } from "redux";

/* ------------------------- Descriptions ------------------------- */

function descriptionsSyncStatus(state = {}, action) {
  switch (action.type) {
    case "SET_HTW_DESCRIPTIONS_SYNC_STATUS":
      return action.payload;
    default:
      return state;
  }
}

function descriptionProducts(state = [], action) {
  switch (action.type) {
    case "SET_HTW_DESCRIPTION_PRODUCTS":
      return action.payload;
    default:
      return state;
  }
}

function descriptionSyncData(state = {}, action) {
  switch (action.type) {
    case "SET_HTW_DESCRIPTION_SYNC_DATA":
      return action.payload;
    default:
      return state;
  }
}

/* ------------------------- Images ------------------------- */

function imagesSyncStatus(state = {}, action) {
  switch (action.type) {
    case "SET_HTW_IMAGES_SYNC_STATUS":
      return action.payload;
    default:
      return state;
  }
}

function imageProducts(state = [], action) {
  switch (action.type) {
    case "SET_HTW_IMAGE_PRODUCTS":
      return action.payload;
    default:
      return state;
  }
}

function imageProductsCount(state = 0, action) {
  switch (action.type) {
    case "SET_HTW_IMAGE_PRODUCTS_COUNT":
      return action.payload;
    default:
      return state;
  }
}

function imageSyncData(state = {}, action) {
  switch (action.type) {
    case "SET_HTW_IMAGE_SYNC_DATA":
      return action.payload;
    default:
      return state;
  }
}

export default combineReducers({
  descriptionsSyncStatus,
  descriptionProducts,
  descriptionSyncData,
  imagesSyncStatus,
  imageProducts,
  imageSyncData,
  imageProductsCount,
});
