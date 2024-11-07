import { useDispatch } from "react-redux";

// Custom hook
export const useQueueActions = () => {
  const dispatch = useDispatch();

  const getQueueItems = (e, sort_by, order) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "GET_DECO_QUEUE_ITEMS", payload: { sort_by, order } });
  };

  const startQueueItem = (e, idArray) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "START_DECO_QUEUE_ITEM", payload: idArray });
  };

  const completeQueueItem = (e, idArray) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "COMPLETE_DECO_QUEUE_ITEM", payload: idArray });
  };

  const sendBackProgressQueueItem = (e, idArray) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "SEND_BACK_PROGRESS_DECO_QUEUE_ITEM", payload: idArray });
  };

  const sendBackCompletedQueueItem = (e, idArray) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "SEND_BACK_COMPLETED_DECO_QUEUE_ITEM", payload: idArray });
  };

  const deleteQueueItem = (e, idArray) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "DELETE_DECO_QUEUE_ITEM", payload: idArray });
  };

  const updateQueueItemPriority = (e, id, priority) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({
      type: "UPDATE_DECO_QUEUE_ITEM_PRIORITY",
      payload: { id, priority },
    });
  };

  const updateThemePreference = (theme, id) => {
    dispatch({ type: "UPDATE_THEME_PREFERENCE", payload: { theme, id } });
  };

  const getColor = (item) => {
    const { sku, description } = item;
    const decoSku3 = sku.slice(0, 6);
    const decoSku5 = sku.slice(0, 3);
    const decoSku7 = sku.slice(0, 7);
    const decoSku6 = sku.slice(0, 8);

    if (
      ["SD1", "SD2", "SD3", "SD4", "SD5", "SD6", "SD7", "SD8", "SD9"].includes(
        decoSku5
      ) ||
      decoSku6 === "SETUPFEE" ||
      description.includes("Rhinestone Bundle")
    ) {
      return "#F7B665";
    } else if (sku.startsWith("STOCK-")) {
      return "rgb(200 142 213)";
    } else if (
      ["CS1", "CS2", "CS3", "CS4", "CS5", "CS6", "CS7", "CS8", "CS9"].includes(
        decoSku5
      ) ||
      decoSku6 === "CUSTOM-S" ||
      description.includes("Pattern Vinyl Sheet and Mask Bundle")
    ) {
      return "#90CA6D";
    } else if (
      [
        "SISER-1",
        "SISER-2",
        "SISER-3",
        "SISER-4",
        "SISER-5",
        "SISER-6",
        "SISER-7",
        "SISER-8",
        "SISER-9",
      ].includes(decoSku7)
    ) {
      return "#F8F18A";
    } else if (
      ["CD1", "CD2", "CD3", "CD4", "CD5", "CD6", "CD7", "CD8", "CD9"].includes(
        decoSku5
      ) ||
      decoSku6 === "CUSTOM-H" ||
      sku.startsWith("PHTVSTOCK-")
    ) {
      return "#EEB7D2";
    } else if (decoSku5 === "SDC") {
      return "#F48267";
    } else if (["SUBPAT"].includes(decoSku3) || sku.startsWith("SUBSTOCK-")) {
      return "#7AD7F0";
    }
    return "white";
  };

  return {
    startQueueItem,
    completeQueueItem,
    sendBackProgressQueueItem,
    sendBackCompletedQueueItem,
    deleteQueueItem,
    updateQueueItemPriority,
    getQueueItems,
    updateThemePreference,
    getColor,
  };
};
