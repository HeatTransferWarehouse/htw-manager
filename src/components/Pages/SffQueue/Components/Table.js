import React, { useEffect, useState } from "react";
import { TableContent } from "./TableContent";
import Table from "@material-ui/core/Table";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import { TableCell, TableHead, TableRow } from "@material-ui/core";
import { TableHeader } from "./TableHeader";
import { Pagination } from "./Pagination";
import { TableNav } from "./TableNav";

export function TableComponent({ props }) {
  const [newItems, setNewItems] = useState(props.items.newItems);
  const [inProgressItems, setInProgressItems] = useState(
    props.items.inProgressItems
  );
  const [completedItems, setCompletedItems] = useState(
    props.items.completedItems
  );

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setNewItems(props.items.newItems);
    setInProgressItems(props.items.inProgressItems);
    setCompletedItems(props.items.completedItems);
  }, [newItems, inProgressItems, completedItems, props.items]);

  return (
    <div
      style={{
        width: "100%",
        marginInline: "auto",
        paddingInline: "1rem",
        marginBottom: "3rem",
        marginTop: "5rem",
      }}>
      <Paper>
        <TableContainer>
          <TableNav
            count={{
              completedCount: completedItems.length,
              inProgressCount: inProgressItems.length,
              newCount: newItems.length,
            }}
          />
          <TableHeader
            props={{
              checkedIds: props.checkedIds,
              setCheckedIds: props.setCheckedIds,
              view: props.view,
              newItems,
              inProgressItems,
              completedItems,
              rowsPerPage,
              setRowsPerPage,
              page,
              setPage,
            }}
          />
          <Table>
            <TableHead>
              <TableRow>
                {props.isMobile ? (
                  <>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                      }}>
                      {props.view === "new"
                        ? newItems.length
                        : props.view === "progress"
                        ? inProgressItems.length
                        : completedItems.length}{" "}
                      Items
                    </TableCell>
                    <TableCell
                      style={{
                        minWidth: "2rem",
                        maxWidth: "2rem",
                      }}></TableCell>
                  </>
                ) : (
                  <>
                    <TableCell
                      style={{
                        minWidth: "3rem",
                        maxWidth: "3rem",
                        fontWeight: "bold",
                      }}
                    />
                    <TableCell
                      style={{
                        minWidth: "8rem",
                        fontWeight: "bold",
                      }}>
                      Order Number
                    </TableCell>
                    <TableCell
                      style={{
                        minWidth: "9.5rem",
                        fontWeight: "bold",
                      }}>
                      Sku
                    </TableCell>
                    <TableCell
                      style={{
                        minWidth: "9.5rem",
                        fontWeight: "bold",
                      }}>
                      Product Name
                    </TableCell>
                    <TableCell
                      style={{
                        minWidth: "15rem",
                        maxWidth: "500px",
                        fontWeight: "bold",
                      }}>
                      Product Options
                    </TableCell>
                    <TableCell
                      style={{
                        minWidth: "3rem",
                        maxWidth: "3rem",
                        fontWeight: "bold",
                      }}>
                      Qty
                    </TableCell>
                    <TableCell
                      style={{
                        minWidth: "4rem",
                        maxWidth: "4rem",
                        fontWeight: "bold",
                      }}>
                      Priority
                    </TableCell>
                    <TableCell
                      style={{
                        minWidth: "6.5rem",
                        fontWeight: "bold",
                      }}>
                      Created At
                    </TableCell>

                    <TableCell
                      style={{
                        minWidth: "3rem",
                        maxWidth: "3rem",
                      }}></TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            {props.view === "new" && (
              <TableContent
                props={{
                  checkedIds: props.checkedIds,
                  isMobile: props.isMobile,
                  items: newItems,
                  itemsLoading: props.itemsLoading,
                  page,
                  rowsPerPage,
                  setCheckedIds: props.setCheckedIds,
                  view: props.view,
                }}
              />
            )}
            {props.view === "progress" && (
              <TableContent
                props={{
                  checkedIds: props.checkedIds,
                  isMobile: props.isMobile,
                  items: inProgressItems,
                  itemsLoading: props.itemsLoading,
                  page,
                  rowsPerPage,
                  setCheckedIds: props.setCheckedIds,
                  view: props.view,
                }}
              />
            )}
            {props.view === "completed" && (
              <TableContent
                props={{
                  checkedIds: props.checkedIds,
                  isMobile: props.isMobile,
                  items: completedItems,
                  itemsLoading: props.itemsLoading,
                  page,
                  rowsPerPage,
                  setCheckedIds: props.setCheckedIds,
                  view: props.view,
                }}
              />
            )}
          </Table>
          <Pagination
            props={{
              view: props.view,
              newItems,
              inProgressItems,
              completedItems,
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
