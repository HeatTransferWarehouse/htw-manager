import React, { useEffect, useState } from "react";
import { TableContent } from "./TableContent";
import Table from "@material-ui/core/Table";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import { TableCell, TableHead, TableRow } from "@material-ui/core";
import { TableHeader } from "./TableHeader";
import { Pagination } from "./Pagination";
import { TableNav } from "./TableNav";
import { useQueueActions } from "../Functions/queue-actions";
import {
  HiOutlineArrowNarrowUp,
  HiOutlineArrowNarrowDown,
} from "react-icons/hi";
import { Filters } from "./Modals";
import Search from "../../../Search/Search";

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
    <button className="sort-button" onClick={(e) => handleSort(e, column)}>
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
    <div className="table-container">
      <Paper className="table-root">
        <TableContainer
          style={{
            position: "relative",
          }}>
          <TableNav
            count={{
              completedCount: items.completedItems.length,
              inProgressCount: items.inProgressItems.length,
              newCount: items.newItems.length,
            }}
          />
          <Search onSearch={handleSearch} />
          <TableHeader
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
            }}
          />
          <Table>
            <TableHead>
              <TableRow>
                {props.isMobile ? (
                  <>
                    <TableCell>{filteredItems.length} Items</TableCell>
                    <TableCell>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          props.setShowFilters(!props.showFilters);
                        }}>
                        Filters
                      </button>
                      <Filters
                        props={{
                          showFilters: props.showFilters,
                          setShowFilters: props.setShowFilters,
                        }}
                      />
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell style={{ minWidth: "3rem", maxWidth: "3rem" }} />
                    <TableCell style={{ minWidth: "8rem" }}>
                      {renderSortButton("order_number", "Order Number")}
                    </TableCell>
                    <TableCell style={{ minWidth: "9.5rem" }}>
                      {renderSortButton("sku", "Sku")}
                    </TableCell>
                    <TableCell style={{ minWidth: "9.5rem" }}>
                      {renderSortButton("description", "Product Name")}
                    </TableCell>
                    <TableCell
                      style={{
                        minWidth: "10rem",
                        maxWidth: "500px",
                        fontWeight: "bold",
                      }}>
                      Product Length
                    </TableCell>
                    <TableCell style={{ minWidth: "3rem", maxWidth: "3rem" }}>
                      {renderSortButton("qty", "Qty")}
                    </TableCell>
                    <TableCell style={{ minWidth: "4rem", maxWidth: "4rem" }}>
                      {renderSortButton("priority", "Priority")}
                    </TableCell>
                    <TableCell style={{ minWidth: "108px" }}>
                      {renderSortButton("created_at", "Created At")}
                    </TableCell>
                    <TableCell style={{ minWidth: "3rem", maxWidth: "3rem" }} />
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableContent
              props={{
                checkedIds: props.checkedIds,
                isMobile: props.isMobile,
                items: filteredItems,
                itemsLoading: props.itemsLoading,
                page,
                rowsPerPage,
                setCheckedIds: props.setCheckedIds,
                view: props.view,
              }}
            />
          </Table>
          <Pagination
            props={{
              view: props.view,
              items: filteredItems,
              rowsPerPage,
              setRowsPerPage,
              page,
              setPage,
            }}
          />
        </TableContainer>
      </Paper>
    </div>
  );
}
