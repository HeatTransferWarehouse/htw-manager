import { combineReducers } from "redux";

/* ------------------------- Descriptions ------------------------- */

function descriptionsSyncStatus(state = {}, action) {
  switch (action.type) {
    case "SET_SFF_DESCRIPTIONS_SYNC_STATUS":
      return action.payload;
    default:
      return state;
  }
}

function descriptionProducts(state = [], action) {
  switch (action.type) {
    case "SET_SFF_DESCRIPTION_PRODUCTS":
      return action.payload;
    default:
      return state;
  }
}

function descriptionSyncData(state = {}, action) {
  switch (action.type) {
    case "SET_SFF_DESCRIPTION_SYNC_DATA":
      return action.payload;
    default:
      return state;
  }
}

/* ------------------------- Images ------------------------- */

function imagesSyncStatus(state = {}, action) {
  switch (action.type) {
    case "SET_SFF_IMAGES_SYNC_STATUS":
      return action.payload;
    default:
      return state;
  }
}

function imageProducts(state = [], action) {
  switch (action.type) {
    case "SET_SFF_IMAGE_PRODUCTS":
      return action.payload;
    default:
      return state;
  }
}

function imageSyncData(state = {}, action) {
  switch (action.type) {
    case "SET_SFF_IMAGE_SYNC_DATA":
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
});
