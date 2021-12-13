import { combineReducers } from "redux";
const redirect = (state = false, action) => {
  switch (action.type) {
    case "SET_REDIRECT":
      return action.payload;
    default:
      return state;
  }
};


const redirectHome = (state = false, action) => {
    switch (action.type) {
      case "SET_REDIRECT_HOME":
        return action.payload;
      default:
        return state;
    }
  };

export default combineReducers({
  redirect,
  redirectHome
});