
import { put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';

function* deleteItem(action) {
  try {
    yield axios.delete(`/api/item/queue/deleteitem/${action.payload}`)
    yield put({ type: "GET_QUEUE_ITEM_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* deleteCustomItem(action) {
  try {
    yield axios.delete(`/api/item/queue/deletecustomitem/${action.payload}`);
    yield put({ type: "GET_CUSTOM_ITEM_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}
function* deleteSentCustomer(action) {
  try {
    yield axios.delete(`/api/item/queue/deletesentcustomer/${action.payload}`);
    yield put({ type: "GET_CONFIRM_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}
function* deleteRespond(action) {
  try {
    yield axios.delete(`/api/item/queue/deleterespond/${action.payload}`);
    yield put({ type: "GET_RESPOND_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* deleteApprove(action) {
  try {
    yield axios.delete(`/api/item/queue/deleteapprove/${action.payload}`);
    yield put({ type: "GET_APPROVE_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* deleteProgress(action) {
  try {
    yield axios.delete(`/api/item/queue/deleteprogress/${action.payload}`);
    yield put({ type: "GET_PROGRESS_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* deleteHistory(action) {
  try {
    yield axios.delete(`/api/item/queue/deletehistory/${action.payload}`);
    yield put({ type: "GET_HISTORY_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* deleteComplete(action) {
  try {
    yield axios.delete(`/api/item/queue/deletecomplete/${action.payload}`);
    yield put({ type: "GET_COMPLETE_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}
function* deleteCustomComplete(action) {
  try {
    yield axios.delete(`/api/item/queue/deletecustomcomplete/${action.payload}`);
    yield put({ type: "GET_CUSTOM_COMPLETE_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}
function* deleteCompleteAll(action) {
  try {
    yield axios.delete(`/api/item/queue/deletecompleteall`);
    yield put({ type: "GET_COMPLETE_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* deleteCompleteRange(action) {
  try {
    yield axios.delete(`/api/user/queue/deletecompleterange`);
    yield put({ type: "GET_COMPLETE_LIST" });
    yield put({ type: "GET_ITEM_LIST_COUNT" });
    yield put({ type: "GET_PROGRESS_LIST_COUNT" });
    yield put({ type: "GET_COMPLETE_LIST_COUNT" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* deleteHistoryRange(action) {
  try {
    yield axios.delete(`/api/user/queue/deletehistoryrange`);
    yield put({ type: "GET_COMPLETE_LIST" });
    yield put({ type: "GET_ITEM_LIST_COUNT" });
    yield put({ type: "GET_PROGRESS_LIST_COUNT" });
    yield put({ type: "GET_COMPLETE_LIST_COUNT" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* addNewItem(action) {
  try {
    yield axios.post('/api/user/queue/addnewitem', action.payload);
    yield put({ type: "GET_QUEUE_ITEM_LIST" });
  } catch (error) {
    console.log('Error with adding a new item:', error);
  }
}

function* startTask(action) {
  try {
    yield axios.post("/api/user/queue/starttask", action.payload);
    yield put({ type: "GET_PROGRESS_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}


function* customerResponse(action) {
  try {
    yield axios.post("/api/user/queue/customerresponse", action.payload);
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* customerConfirm(action) {
  try {
    yield axios.post("/api/user/queue/customerconfirm", action.payload);
    yield put({ type: "GET_CUSTOMER_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* canned(action) {
  try {
    yield axios.post("/api/user/queue/canned", action.payload);
    yield put({ type: "GET_REPLIES" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* cannedEdit(action) {
  try {
    yield axios.put("/api/item/queue/cannededit", action.payload);
    yield put({ type: "GET_REPLIES" });
  } catch (error) {
    console.log("Error with editing an item:", error);
  }
}

function* cannedDelete(action) {
  try {
    yield axios.delete(`/api/item/queue/canneddelete/${action.payload}`);
    yield put({ type: "GET_REPLIES" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}





function* markComplete(action) {
  try {
    yield axios.post("/api/user/queue/markcomplete", action.payload);
    yield put({ type: "GET_COMPLETE_LIST" });
    yield put({ type: "GET_COMPLETE_LIST_COUNT" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}
function* markCompleteCustom(action) {
  try {
    yield axios.post("/api/user/queue/markcompletecustom", action.payload);
    yield put({ type: "GET_COMPLETE_CUSTOM_LIST" });
    yield put({ type: "GET_COMPLETE_CUSTOM_LIST_COUNT" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}
function* backToNew(action) {
  try {
    yield axios.post("/api/user/queue/backtonew", action.payload);
    yield put({ type: "GET_CUSTOM_ITEM_LIST" });
    yield put({ type: "GET_CUSTOM_ITEM_LIST_COUNT" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* goBackNew(action) {
  try {
    yield axios.post("/api/user/queue/gobacknew", action.payload);
    yield put({ type: "GET_QUEUE_ITEM_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}

function* needToRun(action) {
  try {
    yield axios.put("/api/item/queue/run", action.payload);
    yield put({ type: "GET_QUEUE_ITEM_LIST" });
  } catch (error) {
    console.log("Error with editing an item:", error);
  }
}

function* markPriority(action) {
  try {
    yield axios.put("/api/item/queue/priority", action.payload);
    yield put({ type: "GET_QUEUE_ITEM_LIST" });
  } catch (error) {
    console.log("Error with editing an item:", error);
  }
}
function* markPriorityProgress(action) {
  try {
    yield axios.put("/api/item/queue/priorityprogress", action.payload);
    yield put({ type: "GET_PROGRESS_LIST" });
  } catch (error) {
    console.log("Error with editing an item:", error);
  }
}

function* markPriorityCustom(action) {
  try {
    yield axios.put("/api/item/queue/prioritycustom", action.payload);
    yield put({ type: "GET_CUSTOM_ITEM_LIST" });
  } catch (error) {
    console.log("Error with editing an item:", error);
  }
}

function* markPriorityRespond(action) {
  try {
    yield axios.put("/api/item/queue/priorityrespond", action.payload);
    yield put({ type: "GET_RESPOND_LIST" });
  } catch (error) {
    console.log("Error with editing an item:", error);
  }
}
function* markPriorityApprove(action) {
  try {
    yield axios.put("/api/item/queue/priorityapprove", action.payload);
    yield put({ type: "GET_APPROVE_LIST" });
  } catch (error) {
    console.log("Error with editing an item:", error);
  }
}

function* assignTask(action) {
  try {
    yield axios.put("/api/item/queue/assign", action.payload);
    yield put({ type: "GET_QUEUE_ITEM_LIST" });
  } catch (error) {
    console.log("Error with editing an item:", error);
  }
}

function* assignCustomTask(action) {
  try {
    yield axios.put("/api/item/queue/customassign", action.payload);
    yield put({ type: "GET_CUSTOM_ITEM_LIST" });
  } catch (error) {
    console.log("Error with editing an item:", error);
  }
}

function* assignSentCustomer(action) {
  try {
    yield axios.put("/api/item/queue/assignsentcustomer", action.payload);
    yield put({ type: "GET_CUSTOM_ITEM_LIST" });
  } catch (error) {
    console.log("Error with editing an item:", error);
  }
}


function* getUser(action) {
  try {
    //console.log('we are about to get Students', action.type);

    const response = yield axios.get(`/api/item/queue/userlist`);

    yield put({
      type: 'SET_USER',
      payload: response.data
    });

  } catch (error) {
    console.log('Error with getting the list of users:', error);
  }

}


function* getitemlist(action) {
  try {
    const response = yield axios.get(`/api/item/queue/itemlist`);
    yield put({
      type: "SET_ITEM",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* gethistorylist(action) {
  try {
    const response = yield axios.get(`/api/item/queue/historylist`);
    yield put({
      type: "SET_HISTORY",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* checkHistory(action) {
  try {
    const response = yield axios.post("api/item/checkhistory", action.payload);
    yield put({
      type: "SET_HISTORY_TABLE",
      payload: response.data,
    });
  } catch (error) {
    yield put({ type: "STUDENT_REGISTRATION_FAILED" });
  }
}


function* getcustomitemlist(action) {
  try {
    const response = yield axios.get(`/api/item/queue/customitemlist`);
    yield put({
      type: "SET_CUSTOM_ITEM",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getitemlistcount(action) {
  try {
    const response = yield axios.get(`/api/item/queue/itemlistcount`);
    yield put({
      type: "SET_ITEM_COUNT",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getcustomitemlistcount(action) {
  try {
    const response = yield axios.get(`/api/item/queue/customitemlistcount`);
    yield put({
      type: "SET_CUSTOM_ITEM_COUNT",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getprogresslist(action) {
  try {
    const response = yield axios.get(`/api/item/queue/progresslist`);
    yield put({
      type: "SET_PROGRESS",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getprogresslistcount(action) {
  try {
    const response = yield axios.get(`/api/item/queue/progresslistcount`);
    yield put({
      type: "SET_PROGRESS_COUNT",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getconfirmlist(action) {
  try {
    const response = yield axios.get(`/api/item/queue/confirmlist`);
    yield put({
      type: "SET_CONFIRM",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}



function* getconfirmlistcount(action) {
  try {
    const response = yield axios.get(`/api/item/queue/confirmlistcount`);
    yield put({
      type: "SET_CONFIRM_COUNT",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getrespondlist(action) {
  try {
    const response = yield axios.get(`/api/item/queue/respondlist`);
    yield put({
      type: "SET_RESPOND",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getrespondlistcount(action) {
  try {
    const response = yield axios.get(`/api/item/queue/respondlistcount`);
    yield put({
      type: "SET_RESPOND_COUNT",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getapprovelist(action) {
  try {
    const response = yield axios.get(`/api/item/queue/approvelist`);
    yield put({
      type: "SET_APPROVE",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getapprovelistcount(action) {
  try {
    const response = yield axios.get(`/api/item/queue/approvelistcount`);
    yield put({
      type: "SET_APPROVE_COUNT",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getcompletelist(action) {
  try {
    const response = yield axios.get(`/api/item/queue/completelist`);
    yield put({
      type: "SET_COMPLETE",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getcustomcompletelist(action) {
  try {
    const response = yield axios.get(`/api/item/queue/customcompletelist`);
    yield put({
      type: "SET_CUSTOM_COMPLETE",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getcompletelistcount(action) {
  try {
    const response = yield axios.get(`/api/item/queue/completelistcount`);
    yield put({
      type: "SET_COMPLETE_COUNT",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getcustomcompletelistcount(action) {
  try {
    const response = yield axios.get(`/api/item/queue/customcompletelistcount`);
    yield put({
      type: "SET_CUSTOM_COMPLETE_COUNT",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* getreplies(action) {
  try {
    const response = yield axios.get(`/api/item/queue/replies`);
    yield put({
      type: "SET_REPLIES",
      payload: response.data,
    });
  } catch (error) {
    console.log("Error with getting the list of items:", error);
  }
}

function* orderDetails(action) {
  try {
    const response = yield axios.post("/api/item/queue/orderdetails", action.payload);
    yield put({
      type: "SET_DETAILS",
      payload: response.data,
    });
  } catch (error) {
    yield put({ type: "STUDENT_REGISTRATION_FAILED" });
  }
}

function* orderLookup(action) {
  try {
    const response = yield axios.post("/api/item/queue/orderlookup", action.payload);
    yield put({
      type: "SET_ORDER",
      payload: response.data,
    });
  } catch (error) {
    yield put({ type: "STUDENT_REGISTRATION_FAILED" });
  }
}

function* shippingLookup(action) {
  try {
    const response = yield axios.post("/api/item/queue/shippinglookup", action.payload);
    yield put({
      type: "SET_SHIPPING",
      payload: response.data,
    });
  } catch (error) {
    yield put({ type: "STUDENT_REGISTRATION_FAILED" });
  }
}

function* productLookup(action) {
  try {
    const response = yield axios.post(
      "/api/item/queue/productlookup",
      action.payload
    );
    yield put({
      type: "SET_PRODUCT",
      payload: response.data,
    });
  } catch (error) {
    yield put({ type: "STUDENT_REGISTRATION_FAILED" });
  }
}

function* sendSupaColor(action) {
  try {
    yield axios.post("/api/auto/automatesupa", action.payload);
    yield put({ type: "GET_RESPOND_LIST" });
  } catch (error) {
    console.log("Error with adding a new item:", error);
  }
}



//this takes all of the Saga functions and dispatches them
function* QueueItemSaga() {
  yield takeLatest('ADD_NEW_ITEM', addNewItem);
  yield takeLatest('CHECK_HISTORY', checkHistory);
  yield takeLatest('START_ITEM', startTask);
  yield takeLatest('CUSTOMER_CONFIRM', customerConfirm);
  yield takeLatest('CANNED', canned);
  yield takeLatest('CANNED_EDIT', cannedEdit);
  yield takeLatest('CANNED_DELETE', cannedDelete);
  yield takeLatest('CUSTOMER_RESPONSE', customerResponse);
  yield takeLatest('MARK_COMPLETE', markComplete);
  yield takeLatest('MARK_COMPLETE_CUSTOM', markCompleteCustom);
  yield takeLatest('BACK_TO_NEW', backToNew);
  yield takeLatest('ADD_NEW', goBackNew);
  yield takeLatest('NEED_TO_RUN', needToRun);
  yield takeLatest('MARK_PRIORITY', markPriority);
  yield takeLatest('MARK_PRIORITY_PROGRESS', markPriorityProgress);
  yield takeLatest('MARK_PRIORITY_CUSTOM', markPriorityCustom);
  yield takeLatest('MARK_PRIORITY_RESPOND', markPriorityRespond);
  yield takeLatest('MARK_PRIORITY_APPROVE', markPriorityApprove);
  yield takeLatest('ASSIGN_TASK', assignTask);
  yield takeLatest('ASSIGN_CUSTOM_TASK', assignCustomTask);
  yield takeLatest('ASSIGN_SENT_CUSTOMER', assignSentCustomer);
  yield takeLatest('GET_USER', getUser);
  yield takeLatest('GET_QUEUE_ITEM_LIST', getitemlist);
  yield takeLatest('GET_HISTORY_LIST', gethistorylist);
  yield takeLatest('GET_CUSTOM_ITEM_LIST', getcustomitemlist);
  yield takeLatest('GET_ITEM_LIST_COUNT', getitemlistcount);
  yield takeLatest('GET_CUSTOM_ITEM_LIST_COUNT', getcustomitemlistcount);
  yield takeLatest('GET_PROGRESS_LIST', getprogresslist);
  yield takeLatest('GET_PROGRESS_LIST_COUNT', getprogresslistcount);
  yield takeLatest('GET_CONFIRM_LIST', getconfirmlist);
  yield takeLatest('GET_CONFIRM_LIST_COUNT', getconfirmlistcount);
  yield takeLatest('GET_RESPOND_LIST', getrespondlist);
  yield takeLatest('GET_RESPOND_LIST_COUNT', getrespondlistcount);
  yield takeLatest('GET_APPROVE_LIST', getapprovelist);
  yield takeLatest('GET_APPROVE_LIST_COUNT', getapprovelistcount);
  yield takeLatest('GET_COMPLETE_LIST', getcompletelist);
  yield takeLatest('GET_COMPLETE_LIST_COUNT', getcompletelistcount);
  yield takeLatest('GET_CUSTOM_COMPLETE_LIST', getcustomcompletelist);
  yield takeLatest('GET_CUSTOM_COMPLETE_LIST_COUNT', getcustomcompletelistcount);
  yield takeLatest('GET_REPLIES', getreplies);
  yield takeLatest('DELETE_ITEM', deleteItem);
  yield takeLatest('DELETE_CUSTOM_ITEM', deleteCustomItem);
  yield takeLatest('DELETE_SENT_CUSTOMER', deleteSentCustomer);
  yield takeLatest('DELETE_RESPOND', deleteRespond);
  yield takeLatest('DELETE_APPROVE', deleteApprove);
  yield takeLatest('DELETE_PROGRESS', deleteProgress);
  yield takeLatest('DELETE_HISTORY', deleteHistory);
  yield takeLatest('DELETE_COMPLETE', deleteComplete);
  yield takeLatest('DELETE_CUSTOM_COMPLETE', deleteCustomComplete);
  yield takeLatest('DELETE_COMPLETE_ALL', deleteCompleteAll);
  yield takeLatest('DELETE_COMPLETE_RANGE', deleteCompleteRange);
  yield takeLatest('DELETE_HISTORY_RANGE', deleteHistoryRange);
  yield takeLatest('ORDER_DETAILS', orderDetails);
  yield takeLatest('ORDER_LOOKUP', orderLookup);
  yield takeLatest('SHIPPING_LOOKUP', shippingLookup);
  yield takeLatest('PRODUCT_LOOKUP', productLookup);
  yield takeLatest('SEND_SUPACOLOR', sendSupaColor);
}

export default QueueItemSaga;