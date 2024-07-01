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

const sanmar = (state = "WAIT", action) => {
  switch (action.type) {
    case "SET_SANMAR":
      return action.payload;
    case "RESET_SANMAR":
      return "";
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

const supacolorJobDetails = (state = {}, action) => {
  switch (action.type) {
    case "SET_JOB_DETAIL":
      return action.payload;
    case "RESET_JOB_DETAIL":
      return {};
    default:
      return state;
  }
};

const supacolorSort = (state = {}, action) => {
  switch (action.type) {
    case "SET_SUPA_SORT":
      return action.payload;
    default:
      return state;
  }
};

const initialState = {
  isLoading: false,
  popupMessage: null,
};

function artWorkReducer(state = initialState, action) {
  switch (action.type) {
    case "UPLOAD_ARTWORK_REQUEST":
      return {
        ...state,
        isLoading: true,
      };
    case "UPLOAD_ARTWORK_SUCCESS":
      return {
        ...state,
        isLoading: false,
        popupMessage: "Artwork uploaded successfully!",
      };
    case "UPLOAD_ARTWORK_FAILURE":
      return {
        ...state,
        isLoading: false,
        popupMessage: action.payload,
      };
    case "CLEAR_POPUP_MESSAGE":
      return {
        ...state,
        popupMessage: null,
      };
    default:
      return state;
  }
}

function requestJobReducer(state = initialState, action) {
  switch (action.type) {
    case "REQUEST_JOB_DETAILS":
      return {
        ...state,
        isLoading: true,
      };
    case "JOB_DETAILS_SUCCESS":
      return {
        ...state,
        isLoading: false,
        popupMessage: "Artwork uploaded successfully!",
      };
    default:
      return state;
  }
}

function jobsStorage(state = [], action) {
  switch (action.type) {
    case "GET_JOBS_LIST":
      return action.payload;
    default:
      return state;
  }
}

export default combineReducers({
  itemlist,
  sanmarlist,
  clothinglist,
  bcClothinglist,
  sanmar,
  tracking,
  clothingtemplist,
  supacolorJobDetails,
  artWorkReducer,
  requestJobReducer,
  jobsStorage,
  supacolorSort,
});
