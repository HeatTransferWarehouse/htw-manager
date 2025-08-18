import { combineReducers } from 'redux';

function orders(state = [], action) {
  switch (action.type) {
    case 'SET_ORDERS':
      return action.payload;
    default:
      return state;
  }
}

function syncing(state = false, action) {
  switch (action.type) {
    case 'SET_SYNCING':
      return action.payload;
    default:
      return state;
  }
}

function printers(state = [], action) {
  switch (action.type) {
    case 'SET_PRINTERS':
      return action.payload;
    default:
      return state;
  }
}

export default combineReducers({
  orders,
  syncing,
  printers,
});
