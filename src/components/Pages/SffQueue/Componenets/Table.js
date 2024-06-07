import React, { useEffect, useState } from "react";
import { TableContent } from "./TableContent";
import Table from "@material-ui/core/Table";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import TablePagination from "@material-ui/core/TablePagination";
import { Button, TableCell, TableHead, TableRow } from "@material-ui/core";

export function TableComponent({ props }) {
  const [newItems, setNewItems] = useState(props.items.newItems);
  const [inProgressItems, setInProgressItems] = useState(
    props.items.inProgressItems
  );
  const [completedItems, setCompletedItems] = useState(
    props.items.completedItems
  );

  useEffect(() => {
    setNewItems(props.items.newItems);
    setInProgressItems(props.items.inProgressItems);
    setCompletedItems(props.items.completedItems);
  }, [newItems, inProgressItems, completedItems, props.items]);

  const [newRowsPerPage, setNewRowsPerPage] = useState(10);
  const [progressRowsPerPage, setProgressRowsPerPage] = useState(10);
  const [completedRowsPerPage, setCompletedRowsPerPage] = useState(10);

  const [newPage, setNewPage] = useState(0);
  const [progressPage, setProgressPage] = useState(0);
  const [completedPage, setCompletedPage] = useState(0);

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Order Number</TableCell>
              <TableCell>Sku</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Product Options</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Created At</TableCell>
              {props.view === "new" && <TableCell></TableCell>}
            </TableRow>
          </TableHead>
          {props.view === "new" && (
            <TableContent
              props={{
                items: newItems,
                view: props.view,
                checkedIds: props.checkedIds,
                setCheckedIds: props.setCheckedIds,
              }}
            />
          )}
          {props.view === "progress" && (
            <TableContent
              props={{
                items: inProgressItems,
                view: props.view,
                checkedIds: props.checkedIds,
                setCheckedIds: props.setCheckedIds,
              }}
            />
          )}
          {props.view === "completed" && (
            <TableContent
              props={{
                items: completedItems,
                view: props.view,
                checkedIds: props.checkedIds,
                setCheckedIds: props.setCheckedIds,
              }}
            />
          )}
        </Table>
        <TablePagination
          count={
            props.view === "new"
              ? newItems.length
              : props.view === "progress"
              ? inProgressItems.length
              : completedItems.length
          }
          page={
            props.view === "new"
              ? newPage
              : props.view === "progress"
              ? progressPage
              : completedPage
          }
          onPageChange={(e, newPage) => {
            props.view === "new"
              ? setNewPage(newPage)
              : props.view === "progress"
              ? setProgressPage(newPage)
              : setCompletedPage(newPage);
          }}
          onRowsPerPageChange={(e) => {
            if (props.view === "new") {
              setNewRowsPerPage(parseInt(e.target.value));
              setNewPage(0);
            }
            if (props.view === "progress") {
              setProgressRowsPerPage(parseInt(e.target.value));
              setProgressPage(0);
            }
            if (props.view === "completed") {
              setCompletedRowsPerPage(parseInt(e.target.value));
              setCompletedPage(0);
            }
          }}
          rowsPerPage={
            props.view === "new"
              ? newRowsPerPage
              : props.view === "progress"
              ? progressRowsPerPage
              : completedRowsPerPage
          }
        />
      </TableContainer>
    </Paper>
  );
}
