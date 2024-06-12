import { combineReducers } from "redux";

const initialState = {
  loading: false,
};

const sffLoadingReducer = (state = initialState, action) => {
  switch (action.type) {
    case "START_LOADING":
      return { ...state, loading: true };
    case "STOP_LOADING":
      return { ...state, loading: false };
    default:
      return state;
  }
};
const decoLoadingReducer = (state = initialState, action) => {
  switch (action.type) {
    case "START_DECO_LOADING":
      return { ...state, loading: true };
    case "STOP_DECO_LOADING":
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default combineReducers({
  sffLoadingReducer,
  decoLoadingReducer,
});
