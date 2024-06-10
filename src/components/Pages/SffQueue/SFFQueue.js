import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { TableComponent } from "./Components/Table";

import "./Css/main.css";
import { LoadingModal } from "./Components/Modals";

export default function SFFQueue() {
  const location = useLocation();
  const dispatch = useDispatch();
  const searchParams = new URLSearchParams(location.search);
  const queueItems = useSelector((store) => store.sffQueue.queueItems);
  const view = searchParams.get("view") || "new"; // Default to 'new' if no parameter is
  const [newItems, setNewItems] = useState([]);
  const [inProgressItems, setInProgressItems] = useState([]);
  const [completedItems, setCompletedItems] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const loading = useSelector((store) => store.loading.loading);
  const [itemsLoading, setItemsLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [checkedIds, setCheckedIds] = useState([]);

  useEffect(() => {
    dispatch({ type: "GET_QUEUE_ITEMS" });
  }, [dispatch]);

  useEffect(() => {
    const newInProgressItems = [];
    const newCompletedItems = [];
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
    queueItems.length > 0 && setItemsLoading(false);
  }, [queueItems]);

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
        }}
      />
      {loading && <LoadingModal />}
    </>
  );
}
