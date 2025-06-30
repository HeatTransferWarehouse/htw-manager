import { combineReducers } from "redux";

const productsToImport = (state = [], action) => {
  switch (action.type) {
    case "SET_JDS_PRODUCTS_TO_IMPORT":
      return action.payload;
    case "REMOVE_JDS_PRODUCT":
      return state.filter((product, index) => index !== action.payload);
    case "CLEAR_JDS_PRODUCTS_TO_IMPORT":
      return [];
    default:
      return state;
  }
};

const importComplete = (state = false, action) => {
  switch (action.type) {
    case "SET_JDS_IMPORT_COMPLETE":
      return action.payload;
    case "CLEAR_JDS_IMPORT_COMPLETE":
      return false;
    default:
      return state;
  }
};

const error = (state = null, action) => {
  switch (action.type) {
    case "SET_JDS_ERROR":
      return action.payload;
    case "CLEAR_JDS_ERROR":
      return null;
    default:
      return state;
  }
};

const loading = (state = false, action) => {
  switch (action.type) {
    case "SET_JDS_LOADING":
      return action.payload;
    default:
      return state;
  }
};

const bcCategoriesList = (state = [], action) => {
  switch (action.type) {
    case "SET_BIG_COMMERCE_CATEGORIES":
      return action.payload;
    default:
      return state;
  }
};

const bcCategoriesErrors = (state = null, action) => {
  switch (action.type) {
    case "SET_BIG_COMMERCE_CATEGORIES_ERROR":
      return action.payload;
    case "CLEAR_BIG_COMMERCE_CATEGORIES_ERROR":
      return null;
    default:
      return state;
  }
};

const bcProductsAddError = (state = null, action) => {
  switch (action.type) {
    case "SET_BC_ERROR":
      return action.payload;
    case "CLEAR_BC_PRODUCT_ADD_ERROR":
      return null;
    default:
      return state;
  }
};

const bcProductsAddSuccess = (state = false, action) => {
  switch (action.type) {
    case "SET_PRODUCT_ADD_SUCCESS":
      return true;
    case "CLEAR_PRODUCT_ADD_SUCCESS":
      return false;
    default:
      return state;
  }
};

const bcLoading = (state = false, action) => {
  switch (action.type) {
    case "SET_BC_LOADING":
      return action.payload;
    default:
      return state;
  }
};

export default combineReducers({
  productsToImport,
  error,
  loading,
  bcCategoriesList,
  bcCategoriesErrors,
  bcLoading,
  bcProductsAddError,
  bcProductsAddSuccess,
  importComplete,
});
