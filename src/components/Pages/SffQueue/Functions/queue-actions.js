import { useDispatch } from "react-redux";

// Custom hook
export const useQueueActions = () => {
  const dispatch = useDispatch();

  const getQueueItems = (e, sort_by, order) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "GET_QUEUE_ITEMS", payload: { sort_by, order } });
  };

  const startQueueItem = (e, idArray) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "START_QUEUE_ITEM", payload: idArray });
  };

  const completeQueueItem = (e, idArray) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "COMPLETE_QUEUE_ITEM", payload: idArray });
  };

  const sendBackProgressQueueItem = (e, idArray) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "SEND_BACK_PROGRESS_QUEUE_ITEM", payload: idArray });
  };

  const sendBackCompletedQueueItem = (e, idArray) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "SEND_BACK_COMPLETED_QUEUE_ITEM", payload: idArray });
  };

  const deleteQueueItem = (e, idArray) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "DELETE_QUEUE_ITEM", payload: idArray });
  };

  const updateQueueItemPriority = (e, id, priority) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "UPDATE_QUEUE_ITEM_PRIORITY", payload: { id, priority } });
  };

  const holdQueueItem = (e, idArray) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "HOLD_QUEUE_ITEM", payload: idArray });
  };

  return {
    startQueueItem,
    completeQueueItem,
    sendBackProgressQueueItem,
    sendBackCompletedQueueItem,
    deleteQueueItem,
    updateQueueItemPriority,
    getQueueItems,
    holdQueueItem,
  };
};
