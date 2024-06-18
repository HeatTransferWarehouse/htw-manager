import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { DeleteModal, LoadingModal, MobileFilters } from "./Components/Modals";
import { TableComponent } from "./Components/Table";
import { useQueueActions } from "./Functions/queue-actions";

export default function SFFQueue() {
  const location = useLocation();
  const dispatch = useDispatch();

  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view") || "new"; // Default to 'new' if no parameter is
  const loading = useSelector(
    (store) => store.loading.decoLoadingReducer.loading
  );

  const { deleteQueueItem } = useQueueActions();

  const sort = useSelector((store) => store.decoQueueReducer.sort);
  const queueItems = useSelector((store) => store.decoQueueReducer.queueItems);

  const [checkedIds, setCheckedIds] = useState([]);
  const [completedItems, setCompletedItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [inProgressItems, setInProgressItems] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [singleCheckedId, setSingleCheckedId] = useState(null);
  const [filtersActive, setFiltersActive] = useState(false);

  useEffect(() => {
    dispatch({ type: "GET_DECO_QUEUE_ITEMS" });
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
        setFiltersActive(false);
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const newCompletedItems = [];
    const newInProgressItems = [];
    const newNewItems = [];

    queueItems.forEach((item) => {
      if (item.in_progress) {
        newInProgressItems.push(item);
      } else if (item.is_completed) {
        newCompletedItems.push(item);
      } else {
        newNewItems.push(item);
      }
    });

    setInProgressItems(newInProgressItems);
    setCompletedItems(newCompletedItems);
    setNewItems(newNewItems);
    !loading && setItemsLoading(false);
  }, [queueItems, loading]);

  return (
    <>
      <TableComponent
        props={{
          checkedIds,
          items: {
            completedItems,
            inProgressItems,
            newItems,
          },
          itemsLoading,
          isMobile,
          setCheckedIds,
          view,
          sort,
          filtersActive,
          setFiltersActive,
          setDeleteModalActive,
          setSingleCheckedId,
        }}
      />
      {loading && <LoadingModal />}
      {deleteModalActive && (
        <DeleteModal
          props={{
            checkedIds,
            setCheckedIds,
            setDeleteModalActive,
            deleteQueueItem,
            singleCheckedId,
            setSingleCheckedId,
          }}
        />
      )}
      <MobileFilters props={{ filtersActive, setFiltersActive, sort }} />
    </>
  );
}
