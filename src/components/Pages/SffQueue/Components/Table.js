import React, { useEffect, useState } from "react";
import { TableContent } from "./TableContent";
import { Pagination } from "../../../Pagination/Pagination";
import { TableNav } from "./TableNav";
import { useQueueActions } from "../Functions/queue-actions";
import {
  HiOutlineArrowNarrowUp,
  HiOutlineArrowNarrowDown,
} from "react-icons/hi";
import Search from "../../../Search/Search";
import {
  Table,
  TableContainer,
  TableHeadCell,
  TableHeader,
} from "../../../Table/Table";
import { TableHeaderContainer } from "./TableHeader";

export function TableComponent({ props }) {
  const { getQueueItems } = useQueueActions();
  const [items, setItems] = useState({
    newItems: props.items.newItems,
    inProgressItems: props.items.inProgressItems,
    completedItems: props.items.completedItems,
  });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setItems({
      newItems: props.items.newItems,
      inProgressItems: props.items.inProgressItems,
      completedItems: props.items.completedItems,
    });
  }, [props.items]);

  const handleSort = (e, sort_by) => {
    e.stopPropagation();
    e.preventDefault();
    const newOrder =
      props.sort.sort_by === sort_by && props.sort.order === "asc"
        ? "desc"
        : "asc";
    getQueueItems(e, sort_by, newOrder);
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const renderSortButton = (column, label) => (
    <button
      className="w-fit p-2 rounded-md whitespace-nowrap flex items-center gap-1 hover:bg-gray-100"
      onClick={(e) => handleSort(e, column)}>
      {label}
      {props.sort.sort_by === column &&
        (props.sort.order === "asc" ? (
          <HiOutlineArrowNarrowUp />
        ) : (
          <HiOutlineArrowNarrowDown />
        ))}
    </button>
  );

  const currentViewItems =
    props.view === "new"
      ? items.newItems
      : props.view === "progress"
      ? items.inProgressItems
      : items.completedItems;

  // Filter items based on search query
  const filteredItems = currentViewItems.filter(
    (item) =>
      item.order_number.toLowerCase().includes(searchQuery) ||
      item.sku.toLowerCase().includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery)
  );

  return (
    <Table>
      <TableNav
        count={{
          completedCount: items.completedItems.length,
          inProgressCount: items.inProgressItems.length,
          newCount: items.newItems.length,
        }}
        props={{
          setRowsPerPage,
          setPage,
          setCheckedIds: props.setCheckedIds,
        }}
      />
      <Search onSearch={handleSearch} />
      <TableHeaderContainer
        props={{
          checkedIds: props.checkedIds,
          setCheckedIds: props.setCheckedIds,
          setSingleCheckedId: props.setSingleCheckedId,
          setDeleteModalActive: props.setDeleteModalActive,
          singleCheckedId: props.singleCheckedId,
          view: props.view,
          items: filteredItems,
          rowsPerPage,
          setRowsPerPage,
          page,
          setPage,
          isMobile: props.isMobile,
        }}
      />
      <TableContainer>
        {!props.isMobile && (
          <TableHeader>
            <TableHeadCell />
            <TableHeadCell minWidth={"7rem"}>
              {renderSortButton("order_number", "Order Number")}
            </TableHeadCell>
            <TableHeadCell minWidth={"10rem"}>
              {renderSortButton("sku", "Sku")}
            </TableHeadCell>
            <TableHeadCell minWidth={"15rem"}>
              {renderSortButton("description", "Product Name")}
            </TableHeadCell>
            <TableHeadCell minWidth={"15rem"}>Product Length</TableHeadCell>
            <TableHeadCell>{renderSortButton("qty", "Qty")}</TableHeadCell>
            <TableHeadCell minWidth={"5rem"}>
              {renderSortButton("priority", "Priority")}
            </TableHeadCell>
            <TableHeadCell minWidth={"8rem"}>
              {renderSortButton("created_at", "Created At")}
            </TableHeadCell>
            <TableHeadCell />
          </TableHeader>
        )}
        <TableContent
          props={{
            checkedIds: props.checkedIds,
            isMobile: props.isMobile,
            items: filteredItems,
            itemsLoading: props.itemsLoading,
            setSingleCheckedId: props.setSingleCheckedId,
            setDeleteModalActive: props.setDeleteModalActive,
            singleCheckedId: props.singleCheckedId,
            page,
            rowsPerPage,
            setCheckedIds: props.setCheckedIds,
            view: props.view,
          }}
        />
      </TableContainer>
      <Pagination
        props={{
          view: props.view,
          items: filteredItems,
          rowsPerPage,
          setRowsPerPage,
          page,
          position: "bottom",
          setPage,
        }}
      />
    </Table>
  );
}
