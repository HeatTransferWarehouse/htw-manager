import { useDispatch } from "react-redux";

// Custom hook
export const useQueueActions = () => {
  const dispatch = useDispatch();

  const getQueueItems = (sort_by, order) => {
    dispatch({ type: "GET_CLOTHING_QUEUE_ITEMS", payload: { sort_by, order } });
  };

  const updateQueueOrderedStatus = (id, boolean) => {
    // Normalize id to an array if it's not already an array
    const idArray = Array.isArray(id) ? id : [id];

    if (idArray.some((id) => isNaN(id))) {
      throw new Error("idArray must contain valid integers.");
    }

    if (typeof boolean !== "boolean") {
      throw new Error("boolean must be a valid boolean.");
    }

    dispatch({
      type: "UPDATE_CLOTHING_QUEUE_ORDER_STATUS",
      payload: { idArray, boolean },
    });
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
