import React, { useEffect, useState } from "react";
import { TableContent } from "./TableContent";
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
import { IoMdInformationCircle } from "react-icons/io";
import {
  PaginationControls,
  PaginationOption,
  PaginationTrigger,
  Pagination,
  PaginationSheet,
} from "../../../ui/pagination";

export function TableComponent({ props }) {
  const { getQueueItems } = useQueueActions();
  const [items, setItems] = useState({
    newItems: props.items.newItems,
    inProgressItems: props.items.inProgressItems,
    completedItems: props.items.completedItems,
  });
  const [rowsPerPage, setRowsPerPage] = useState(25);
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
  const filteredItems = currentViewItems.filter((item) => {
    let searchMatch = false;

    if (searchQuery.includes(":")) {
      // Advanced search
      const queryParts = searchQuery.split("&").map((part) => part.split(":"));

      const searchMap = {};
      queryParts.forEach(([key, value]) => {
        if (value) {
          if (!searchMap[key]) {
            searchMap[key] = [];
          }
          searchMap[key].push(value.toLowerCase());
        }
      });

      searchMatch = Object.keys(searchMap).every((key) => {
        if (key === "sku") {
          return searchMap[key].some((value) =>
            item.sku.toLowerCase().includes(value)
          );
        } else if (key === "id") {
          return searchMap[key].some((value) =>
            item.order_number.toString().includes(value)
          );
        } else if (key === "name") {
          return searchMap[key].some((value) =>
            item.description.toLowerCase().includes(value)
          );
        } else if (key === "date") {
          return searchMap[key].some((value) =>
            item.created_at.toLowerCase().includes(value)
          );
        } else if (key === "qty") {
          return searchMap[key].some((value) =>
            item.qty.toString().toLowerCase().includes(value)
          );
        }
        return false;
      });
    } else {
      // Basic search
      searchMatch =
        item.order_number.toString().includes(searchQuery) ||
        item.sku.toLowerCase().includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery) ||
        item.created_at.toLowerCase().includes(searchQuery);
    }

    return searchMatch;
  });

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
      <div className="flex px-4 mt-6 relative items-start md:items-center flex-col md:flex-row justify-start gap-4 mb-4">
        <span
          className="z-50 flex gap-2 items-center absolute hover:text-secondary cursor-pointer group/searchInfo left-4 -top-8"
          onClick={props.setShowAdvancedSearchModal}>
          <IoMdInformationCircle className="w-6 h-6 hover/group-searchInfo:fill-secondary" />
          <p>Learn about Advanced Searching</p>
        </span>
        <Search onSearch={handleSearch} className="m-0 p-0" />
      </div>
      <TableHeaderContainer
        props={{
          checkedIds: props.checkedIds,
          setCheckedIds: props.setCheckedIds,
          view: props.view,
          items: filteredItems,
          rowsPerPage,
          setRowsPerPage,
          page,
          setPage,
          isMobile: props.isMobile,
          setDeleteModalActive: props.setDeleteModalActive,
          setFiltersActive: props.setFiltersActive,
        }}
      />
      <TableContainer tableFor={"queue"}>
        {!props.isMobile && (
          <TableHeader>
            <TableHeadCell />
            <TableHeadCell minWidth="7rem">
              {renderSortButton("order_number", "Order Number")}
            </TableHeadCell>
            <TableHeadCell minWidth="10rem">
              {renderSortButton("sku", "Sku")}
            </TableHeadCell>
            <TableHeadCell minWidth="15rem">
              {renderSortButton("description", "Product Name")}
            </TableHeadCell>
            <TableHeadCell>{renderSortButton("qty", "Qty")}</TableHeadCell>
            <TableHeadCell minWidth="5rem">
              {renderSortButton("priority", "Priority")}
            </TableHeadCell>
            <TableHeadCell minWidth="8rem">
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
            page,
            rowsPerPage,
            setCheckedIds: props.setCheckedIds,
            setDeleteModalActive: props.setDeleteModalActive,
            setSingleCheckedId: props.setSingleCheckedId,
            view: props.view,
          }}
        />
      </TableContainer>
      <Pagination
        props={{
          items: filteredItems,
          rowsPerPage,
          page: page,
          setPage,
          setRowsPerPage,
        }}>
        <PaginationTrigger />
        <PaginationControls />
        <PaginationSheet sheetPosition={"bottom"}>
          <PaginationOption value={10}>10</PaginationOption>
          <PaginationOption value={25}>25</PaginationOption>
          <PaginationOption value={50}>50</PaginationOption>
          <PaginationOption value={100}>100</PaginationOption>
        </PaginationSheet>
      </Pagination>
    </Table>
  );
}
