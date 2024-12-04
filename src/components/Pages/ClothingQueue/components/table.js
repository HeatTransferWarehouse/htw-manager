import React, { useEffect, useState } from "react";
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
import { Nav } from "./nav";
import { Header } from "./header";
import { TableContent } from "./table-body";
import { useQueueActions } from "../functions/actions";
import { IoMdInformationCircle } from "react-icons/io";
import {
  PaginationControls,
  PaginationOption,
  PaginationSheet,
  PaginationTrigger,
  Pagination,
} from "../../../ui/pagination";

export function TableComponent({ props }) {
  const { getQueueItems } = useQueueActions();
  const [items, setItems] = useState({
    newItems: props.items.newItems,
    orderedItems: props.items.orderedItems,
  });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setItems({
      newItems: props.items.newItems,
      orderedItems: props.items.orderedItems,
    });
  }, [props.items]);

  const handleSort = (sort_by) => {
    const newOrder =
      props.sort.sort_by === sort_by && props.sort.order === "asc"
        ? "desc"
        : "asc";
    getQueueItems(sort_by, newOrder);
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const renderSortButton = (column, label) => (
    <button
      className="w-fit p-2 rounded-md whitespace-nowrap flex items-center gap-1 hover:bg-gray-100"
      onClick={(e) => handleSort(column)}>
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
    props.view === "new" ? items.newItems : items.orderedItems;

  // Filter items based on search query and date
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
            (item.sku ?? "").toString().toLowerCase().includes(value)
          );
        } else if (key === "id") {
          return searchMap[key].some((value) =>
            (item.order_id ?? "").toString().includes(value)
          );
        } else if (key === "name") {
          return searchMap[key].some((value) =>
            (item.description ?? "").toLowerCase().includes(value)
          );
        } else if (key === "date") {
          return searchMap[key].some((value) =>
            (item.date ?? "").toLowerCase().includes(value)
          );
        } else if (key === "qty") {
          return searchMap[key].some((value) =>
            (item.qty ?? "").toString().toLowerCase().includes(value)
          );
        }
        return false;
      });
    } else {
      // Basic search
      searchMatch =
        (item.order_id ?? "").toString().includes(searchQuery) ||
        (item.sku ?? "").toString().toLowerCase().includes(searchQuery) ||
        (item.description ?? "").toLowerCase().includes(searchQuery) ||
        (item.date ?? "").toLowerCase().includes(searchQuery);
    }

    return searchMatch;
  });

  return (
    <Table>
      <Nav
        count={{
          newCount: items.newItems.length,
          orderedCount: items.orderedItems.length,
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
        <Search onSearch={handleSearch} className={"!m-0 !p-0"} />
      </div>
      <Header
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
      <TableContainer tableFor={"clothing"}>
        {!props.isMobile && (
          <TableHeader>
            <TableHeadCell />
            <TableHeadCell minWidth={"7rem"}>
              {renderSortButton("order_id", "Order Number")}
            </TableHeadCell>
            <TableHeadCell minWidth={"10rem"}>
              {renderSortButton("sku", "Sku")}
            </TableHeadCell>
            <TableHeadCell minWidth={"15rem"}>
              {renderSortButton("name", "Product Name")}
            </TableHeadCell>
            <TableHeadCell minWidth={"7rem"}>
              {renderSortButton("color", "Color")}
            </TableHeadCell>
            <TableHeadCell minWidth={"7rem"}>
              {renderSortButton("size", "Size")}
            </TableHeadCell>
            <TableHeadCell>{renderSortButton("qty", "Qty")}</TableHeadCell>
            <TableHeadCell minWidth={"8rem"}>
              {renderSortButton("date", "Order For")}
            </TableHeadCell>
            <TableHeadCell />
            <span className="hidden" />
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
          setRowsPerPage,
          page,
          setPage,
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
