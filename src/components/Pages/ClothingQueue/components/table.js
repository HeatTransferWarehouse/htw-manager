import React, { useEffect, useState } from "react";
import { Pagination } from "../../../Pagination/Pagination";
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

  // Filter items based on search query
  const filteredItems = currentViewItems.filter(
    (item) =>
      item.order_id.toString().includes(searchQuery) ||
      item.sku.toLowerCase().includes(searchQuery) ||
      item.name.toLowerCase().includes(searchQuery) ||
      item.date.toLowerCase().includes(searchQuery) ||
      item.color.toLowerCase().includes(searchQuery) ||
      item.size.toLowerCase().includes(searchQuery)
  );

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
      <Search onSearch={handleSearch} />
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
      <TableContainer>
        {!props.isMobile && (
          <TableHeader tableFor={"clothing"}>
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
            <TableHeadCell>{renderSortButton("quantity", "Qty")}</TableHeadCell>
            <TableHeadCell minWidth={"8rem"}>
              {renderSortButton("date", "Created At")}
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
