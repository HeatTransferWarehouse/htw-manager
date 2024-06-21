import { useDispatch } from "react-redux";

// Custom hook
export const useQueueActions = () => {
  const dispatch = useDispatch();

  const getQueueItems = (sort_by, order) => {
    dispatch({ type: "GET_CLOTHING_QUEUE_ITEMS", payload: { sort_by, order } });
  };

  const updateQueueOrderedStatus = (idArray) => {
    dispatch({ type: "UPDATE_CLOTHING_QUEUE_ORDER_STATUS", payload: idArray });
  };

  const deleteQueueItem = (idArray) => {
    dispatch({ type: "DELETE_CLOTHING_QUEUE_ITEM", payload: idArray });
  };

  return {
    deleteQueueItem,
    updateQueueOrderedStatus,
    getQueueItems,
  };
};
