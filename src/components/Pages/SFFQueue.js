import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Header } from "./SffQueue/Componenets/Headers";

import "./SffQueue/Css/main.css";
import { useLocation } from "react-router-dom";
import { TableComponent } from "./SffQueue/Componenets/Table";

export default function SFFQueue() {
  const location = useLocation();
  const dispatch = useDispatch();
  const searchParams = new URLSearchParams(location.search);
  const queueItems = useSelector((store) => store.sffQueue.queueItems);
  const view = searchParams.get("view") || "new"; // Default to 'new' if no parameter is
  const [newItems, setNewItems] = useState([]);
  const [inProgressItems, setInProgressItems] = useState([]);
  const [completedItems, setCompletedItems] = useState([]);

  const [checkedIds, setCheckedIds] = useState([]);

  console.log(checkedIds);

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
  }, [queueItems]);

  return (
    <>
      <Header
        count={{
          newCount: newItems.length,
          inProgressCount: inProgressItems.length,
          completedCount: completedItems.length,
        }}
      />
      <TableComponent
        props={{
          items: {
            newItems,
            inProgressItems,
            completedItems,
          },
          view,
          checkedIds,
          setCheckedIds,
        }}
      />
    </>
  );
}
