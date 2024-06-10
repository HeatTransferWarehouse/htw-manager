import { useDispatch } from "react-redux";

// Custom hook
export const useQueueActions = () => {
  const dispatch = useDispatch();

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

  return {
    startQueueItem,
    completeQueueItem,
    sendBackProgressQueueItem,
    sendBackCompletedQueueItem,
    deleteQueueItem,
    updateQueueItemPriority,
  };
};
