import React, { useState } from "react";
import { Pagination } from "./Pagination";
import { useQueueActions } from "../Functions/queue-actions";

export function TableHeader({ props }) {
  const [allSelected, setAllSelected] = useState(false);
  const {
    startQueueItem,
    completeQueueItem,
    deleteQueueItem,
    sendBackCompletedQueueItem,
    sendBackProgressQueueItem,
    updateQueueItemPriority,
  } = useQueueActions();
  const handleSelectAll = () => {
    let allIds = [];

    if (props.view === "new") {
      allIds = props.newItems.map((item) => item.id);
    } else if (props.view === "progress") {
      allIds = props.inProgressItems.map((item) => item.id);
    } else if (props.view === "completed") {
      allIds = props.completedItems.map((item) => item.id);
    }

    // Use the current checkedIds to determine if we should select all or deselect all
    const allSelected =
      allIds.length > 0 && allIds.every((id) => props.checkedIds.includes(id));

    if (allSelected) {
      // Deselect all if all are selected
      props.setCheckedIds((prevIds) =>
        prevIds.filter((id) => !allIds.includes(id))
      );
    } else {
      // Select all
      props.setCheckedIds((prevIds) => [...new Set([...prevIds, ...allIds])]);
    }
  };

  const isAllSelected = () => {
    let allIds = [];

    if (props.view === "new") {
      allIds = props.newItems.map((item) => item.id);
    } else if (props.view === "progress") {
      allIds = props.inProgressItems.map((item) => item.id);
    } else if (props.view === "completed") {
      allIds = props.completedItems.map((item) => item.id);
    }

    return (
      allIds.length > 0 && allIds.every((id) => props.checkedIds.includes(id))
    );
  };

  return (
    <div className="table-header">
      <div className="table-header-actions">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}>
          <input
            style={{
              margin: "0px",
            }}
            className="checkbox-input"
            type="checkbox"
            checked={isAllSelected()}
            onChange={handleSelectAll}
          />
          <p>
            {props.view === "new"
              ? props.newItems.length
              : props.view === "progress"
              ? props.inProgressItems.length
              : props.completedItems.length}{" "}
            Items
          </p>
        </div>
        {allSelected ||
          (props.checkedIds.length > 0 &&
            (props.view === "new" ? (
              <>
                <button
                  className="table-header-button"
                  onClick={(e) => {
                    startQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}>
                  Start
                </button>
                <button
                  className="table-header-button"
                  onClick={(e) => {
                    completeQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}>
                  Complete
                </button>
                <button
                  className="table-header-button"
                  onClick={(e) => {
                    deleteQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}>
                  Delete
                </button>
              </>
            ) : props.view === "progress" ? (
              <>
                <button
                  className="table-header-button"
                  onClick={(e) => {
                    completeQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}>
                  Complete
                </button>
                <button
                  className="table-header-button"
                  onClick={(e) => {
                    sendBackProgressQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}>
                  Send to New
                </button>
                <button
                  className="table-header-button"
                  onClick={(e) => {
                    deleteQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}>
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  className="table-header-button"
                  onClick={(e) => {
                    sendBackCompletedQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}>
                  Send to Progress
                </button>
                <button
                  className="table-header-button"
                  onClick={(e) => {
                    sendBackProgressQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}>
                  Send to New
                </button>
                <button
                  className="table-header-button"
                  onClick={(e) => {
                    deleteQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}>
                  Delete
                </button>
              </>
            )))}
      </div>
      <Pagination
        props={{
          view: props.view,
          newItems: props.newItems,
          inProgressItems: props.inProgressItems,
          completedItems: props.completedItems,
          rowsPerPage: props.rowsPerPage,
          setRowsPerPage: props.setRowsPerPage,
          page: props.page,
          setPage: props.setPage,
        }}
      />
    </div>
  );
}
