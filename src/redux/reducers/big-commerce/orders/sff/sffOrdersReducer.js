import { combineReducers } from 'redux';

function orders(state = [], action) {
  switch (action.type) {
    case 'SET_SFF_ORDERS':
      return action.payload;
    default:
      return state;
  }
}

function syncing(state = false, action) {
  switch (action.type) {
    case 'SET_SFF_SYNCING':
      return action.payload;
    default:
      return state;
  }
}

function loading(state = false, action) {
  switch (action.type) {
    case 'SET_SFF_ORDERS_LOADING':
      return action.payload;
    default:
      return state;
  }
}

function printers(state = [], action) {
  switch (action.type) {
    case 'SET_SFF_PRINTERS':
      return action.payload;
    default:
      return state;
  }
}

function tags(state = [], action) {
  switch (action.type) {
    case 'SET_SFF_TAGS':
      return action.payload;
    default:
      return state;
  }
}

function errors(state = {}, action) {
  switch (action.type) {
    case 'SET_SFF_ORDERS_ERROR':
      return action.payload;
    case 'CLEAR_SFF_ORDERS_ERROR':
      return {};
    default:
      return state;
  }
}

function success(state = {}, action) {
  switch (action.type) {
    case 'SET_SFF_ORDERS_SUCCESS':
      return action.payload;
    case 'CLEAR_SFF_ORDERS_SUCCESS':
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
