import React, { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { MdOutlineChecklistRtl } from "react-icons/md";
import { CgTrash } from "react-icons/cg";
import { twMerge } from "tailwind-merge";
import { useQueueActions } from "../functions/actions";
import {
  PaginationControls,
  PaginationOption,
  PaginationSheet,
  PaginationTrigger,
  Pagination,
} from "../../../ui/pagination";

export function Header({ props }) {
  const [allSelected, setAllSelected] = useState(false);
  const { updateQueueOrderedStatus } = useQueueActions();

  const handleSelectAll = () => {
    let pageItems = [];

    // Calculate start and end index based on current page and rows per page
    const startIndex = props.page * props.rowsPerPage;
    const endIndex = startIndex + props.rowsPerPage;

    // Get items for the current page
    pageItems = props.items.slice(startIndex, endIndex).map((item) => item.id);

    // Determine if all items on the current page are selected
    const allSelected =
      pageItems.length > 0 &&
      pageItems.every((id) => props.checkedIds.includes(id));

    if (allSelected) {
      // Deselect all items on the current page
      props.setCheckedIds((prevIds) =>
        prevIds.filter((id) => !pageItems.includes(id))
      );
    } else {
      // Select all items on the current page
      props.setCheckedIds((prevIds) => [
        ...new Set([...prevIds, ...pageItems]),
      ]);
    }
  };

  const isAllSelected = () => {
    let pageItems = [];

    // Calculate start and end index based on current page and rows per page
    const startIndex = props.page * props.rowsPerPage;
    const endIndex = startIndex + props.rowsPerPage;

    // Get items for the current page
    pageItems = props.items.slice(startIndex, endIndex).map((item) => item.id);

    return (
      pageItems.length > 0 &&
      pageItems.every((id) => props.checkedIds.includes(id))
    );
  };

  return (
    <div
      className={twMerge(
        "flex justify-between items-center py-2 border-t border-b border-solid border-gray-200"
      )}>
      <div
        style={{
          width: props.isMobile ? "100%" : "fit-content",
        }}
        className="flex items-start md:items-center max-md:flex-col overflow-hidden">
        <div
          className="flex items-center justify-between pl-2 pr-4"
          style={{
            width: props.isMobile ? "100%" : "fit-content",
          }}>
          <div className="flex items-center gap-2">
            <span className="checkbox-container">
              <input
                style={{
                  margin: "0px",
                }}
                className="checkbox-input w-"
                type="checkbox"
                id="select-all"
                checked={isAllSelected()}
                onChange={handleSelectAll}
              />
              <label htmlFor="select-all">
                <FaCheck />
              </label>
            </span>
            {props.checkedIds.length > 0 ? (
              <>
                <p>
                  {props.checkedIds.length}/{props.items.length} Items
                </p>
              </>
            ) : (
              <>
                {" "}
                <p>{props.items.length} Items</p>
              </>
            )}
          </div>
        </div>
        {allSelected ||
          (props.checkedIds.length > 0 &&
            (props.view === "new" ? (
              <div className="flex items-center px-4 pt-2 max-md:pb-2 justify-start gap-2 max-w-full md:w-fit overflow-x-auto">
                <button
                  className="w-fit min-w-fit flex items-center justify-center gap-2 snap-start whitespace-nowrap border border-solid text-secondary hover:bg-secondary/10 border-secondary rounded-md p-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateQueueOrderedStatus(props.checkedIds, true);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}>
                  Mark Ordered
                  <MdOutlineChecklistRtl className="fill-secondary w-6 h-6" />
                </button>
                <button
                  className="w-fit min-w-fit flex items-center justify-center gap-2 snap-start whitespace-nowrap border border-solid text-red-600 hover:bg-red-600/10 border-red-600 rounded-md p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    props.setDeleteModalActive(props.checkedIds);
                    setAllSelected(false);
                  }}>
                  Delete
                  <CgTrash className="w-5 h-5 fill-red-600" />
                </button>
              </div>
            ) : (
              <div className="flex items-center px-4 pt-2 max-md:pb-2 justify-start gap-2 max-w-full md:gro overflow-x-auto">
                <button
                  className="w-fit min-w-fit flex items-center justify-center gap-2 snap-start whitespace-nowrap border border-solid text-secondary hover:bg-secondary/10 border-secondary rounded-md p-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateQueueOrderedStatus(props.checkedIds, false);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}>
                  Un-Mark Ordered
                  <MdOutlineChecklistRtl className="fill-secondary w-6 h-6" />
                </button>
                <button
                  className="w-fit min-w-fit flex items-center justify-center gap-2 snap-start whitespace-nowrap border border-solid text-red-600 hover:bg-red-600/10 border-red-600 rounded-md p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    props.setDeleteModalActive(props.checkedIds);
                    setAllSelected(false);
                  }}>
                  Delete
                  <CgTrash className="w-5 h-5 fill-red-600" />
                </button>
              </div>
            )))}
      </div>
      {!props.isMobile && (
        <Pagination
          props={{
            items: props.items,
            rowsPerPage: props.rowsPerPage,
            setRowsPerPage: props.setRowsPerPage,
            page: props.page,
            setPage: props.setPage,
          }}>
          <PaginationTrigger />
          <PaginationControls />
          <PaginationSheet sheetPosition={"top"}>
            <PaginationOption value={10}>10</PaginationOption>
            <PaginationOption value={25}>25</PaginationOption>
            <PaginationOption value={50}>50</PaginationOption>
            <PaginationOption value={100}>100</PaginationOption>
          </PaginationSheet>
        </Pagination>
      )}
    </div>
  );
}
