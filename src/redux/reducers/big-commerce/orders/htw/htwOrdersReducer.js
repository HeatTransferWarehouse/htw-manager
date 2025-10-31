import { combineReducers } from 'redux';

function orders(state = [], action) {
  switch (action.type) {
    case 'SET_HTW_ORDERS':
      return action.payload;
    default:
      return state;
  }
}

function syncing(state = false, action) {
  switch (action.type) {
    case 'SET_HTW_SYNCING':
      return action.payload;
    default:
      return state;
  }
}

function loading(state = false, action) {
  switch (action.type) {
    case 'SET_HTW_ORDERS_LOADING':
      return action.payload;
    default:
      return state;
  }
}

function printers(state = [], action) {
  switch (action.type) {
    case 'SET_HTW_PRINTERS':
      return action.payload;
    default:
      return state;
  }
}

function tags(state = [], action) {
  switch (action.type) {
    case 'SET_HTW_TAGS':
      return action.payload;
    default:
      return state;
  }
}

function errors(state = {}, action) {
  switch (action.type) {
    case 'SET_HTW_ORDERS_ERROR':
      return action.payload;
    case 'CLEAR_HTW_ORDERS_ERROR':
      return {};
    default:
      return state;
  }
}

function success(state = {}, action) {
  switch (action.type) {
    case 'SET_HTW_ORDERS_SUCCESS':
      return action.payload;
    case 'CLEAR_HTW_ORDERS_SUCCESS':
      return {};
    default:
      return state;
  }
}

export default combineReducers({
  orders,
  syncing,
  printers,
  tags,
  loading,
  errors,
  success,
});
