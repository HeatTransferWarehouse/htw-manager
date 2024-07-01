import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import {
  LoadingModal,
  MobileFilters,
  AdvancedSearchModal,
} from "./Components/Modals";
import { TableComponent } from "./Components/Table";
import { useQueueActions } from "./Functions/queue-actions";
import DeleteModal from "../../modals/deleteModal";
import { BreakpointsContext } from "../../../context/BreakpointsContext";

export default function SFFQueue() {
  const location = useLocation();
  const dispatch = useDispatch();
  const breakpoint = useContext(BreakpointsContext);

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
  const [showAdvancedSearchModal, setShowAdvancedSearchModal] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [inProgressItems, setInProgressItems] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [singleCheckedId, setSingleCheckedId] = useState(null);
  const [filtersActive, setFiltersActive] = useState(false);

  useEffect(() => {
    dispatch({ type: "GET_DECO_QUEUE_ITEMS" });
  }, [dispatch]);

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
          isMobile: breakpoint === "mobile",
          setCheckedIds,
          view,
          sort,
          filtersActive,
          setFiltersActive,
          setDeleteModalActive,
          setSingleCheckedId,
          setShowAdvancedSearchModal,
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
        <MobileFilters props={{ filtersActive, setFiltersActive, sort }} />
        <AdvancedSearchModal
          props={{ setShowAdvancedSearchModal, open: showAdvancedSearchModal }}
        />
      </div>
    </>
  );
}
