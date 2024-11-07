import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { LoadingModal } from "./Components/Modals";
import { TableComponent } from "./Components/Table";
import DeleteModal from "../../modals/deleteModal";
import { useQueueActions } from "./Functions/queue-actions";

export default function SFFQueue() {
  const location = useLocation();
  const dispatch = useDispatch();

  const { deleteQueueItem } = useQueueActions();

  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view") || "new"; // Default to 'new' if no parameter is

  const loading = useSelector(
    (store) => store.loading.sffLoadingReducer.loading
  );
  const sort = useSelector((store) => store.sffQueue.sort);
  const queueItems = useSelector((store) => store.sffQueue.queueItems);

  const [checkedIds, setCheckedIds] = useState([]);
  const [completedItems, setCompletedItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [inProgressItems, setInProgressItems] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [singleCheckedId, setSingleCheckedId] = useState(null);
  const [deleteModalActive, setDeleteModalActive] = useState(false);

  useEffect(() => {
    dispatch({ type: "GET_QUEUE_ITEMS" });
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
        setShowFilters(false);
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
      } else if (item.is_complete) {
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

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (checkedIds.length === 0) {
      deleteQueueItem(e, singleCheckedId);
      setSingleCheckedId(null);
    } else {
      deleteQueueItem(e, checkedIds);
      setCheckedIds([]);
    }
    setDeleteModalActive(false);
    setDeleteModalActive(false);
  };

  return (
    <>
      <h1 className="font-bold mx-auto mb-4 mt-8 text-4xl">SFF Queue</h1>
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
          setDeleteModalActive,
          view,
          sort,
          showFilters,
          setShowFilters,
          setSingleCheckedId,
          singleCheckedId,
        }}
      />
      <div>
        {loading && <LoadingModal />}
        <DeleteModal
          props={{
            open: deleteModalActive,
            setOpen: setDeleteModalActive,
            deleteFunction: handleDelete,
          }}
        />
      </div>
    </>
  );
}
