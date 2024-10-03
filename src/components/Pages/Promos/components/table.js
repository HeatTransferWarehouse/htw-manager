import React, { useState } from "react";
import {
  Table,
  TableContainer,
  TableHeadCell,
  TableHeader,
} from "../../../Table/Table";

import Search from "../../../Search/Search";
import { TableNav } from "./tablenav";

import {
  HiOutlineArrowNarrowDown,
  HiOutlineArrowNarrowUp,
} from "react-icons/hi";
import TableHeaderContainer from "./tableHeaders";
import { TableContent } from "./tableContent";

export default function TableComponent({ props }) {
  const promotions = props.promotions?.data;
  const metaData = props.promotions?.meta;

  const [searchQuery, setSearchQuery] = useState("");
  const totalItems = metaData?.pagination.total;
  const rangeArray = Array.from({ length: totalItems || 0 }, (_, i) => i + 1);

  const filteredPromotions =
    promotions &&
    promotions.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery) ||
        JSON.stringify(item.id)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const handleSort = (e, sort_by) => {
    e.stopPropagation();
    e.preventDefault();
    const newOrder =
      props.sort === sort_by && props.direction === "asc" ? "desc" : "asc";
    props.setSort(sort_by);
    props.setDirection(newOrder);
  };

  const renderSortButton = (column, label) => (
    <button
      className="w-fit p-2 rounded-md whitespace-nowrap flex items-center gap-1 hover:bg-gray-100"
      onClick={(e) => handleSort(e, column)}>
      {label}
      {props.sort === column &&
        (props.direction === "asc" ? (
          <HiOutlineArrowNarrowUp />
        ) : (
          <HiOutlineArrowNarrowDown />
        ))}
    </button>
  );

  return (
    <Table>
      <TableNav />
      <Search onSearch={handleSearch} />

      <TableHeaderContainer
        props={{
          items: rangeArray || 0,
          view: props.view,
          rowsPerPage: props.rowsPerPage,
          setRowsPerPage: props.setRowsPerPage,
          page: props.page,
          setPage: props.setPage,
        }}
      />
      <TableContainer>
        <TableHeader tableFor={"promos"}>
          <TableHeadCell minWidth={"7rem"}>
            {renderSortButton("id", "Id")}
          </TableHeadCell>
          <TableHeadCell minWidth={"10rem"}>
            {renderSortButton("name", "Name")}
          </TableHeadCell>
          <TableHeadCell minWidth={"10rem"}>
            {renderSortButton("start_date", "Start Date")}
          </TableHeadCell>
          <TableHeadCell minWidth={"10rem"}>End Date</TableHeadCell>
          <TableHeadCell minWidth={"7rem"}>Status</TableHeadCell>
          <TableHeadCell minWidth={"7rem"} />
        </TableHeader>
        <TableContent
          props={{
            items: filteredPromotions || [],
            page: props.page,
            rowsPerPage: props.rowsPerPage,
            itemsLoading: props.loading,
          }}
        />
      </TableContainer>
    </Table>
  );
}
