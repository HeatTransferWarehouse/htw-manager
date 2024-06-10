import React from "react";
import { TablePagination } from "@material-ui/core";

export function Pagination({ props }) {
  return (
    <TablePagination
      component="div"
      count={
        props.view === "new"
          ? props.newItems.length
          : props.view === "progress"
          ? props.inProgressItems.length
          : props.completedItems.length
      }
      onPageChange={(event, newPage) => props.setPage(newPage)}
      onRowsPerPageChange={(event) => {
        props.setRowsPerPage(parseInt(event.target.value, 10));
        props.setPage(0);
      }}
      rowsPerPage={props.rowsPerPage}
      page={props.page}
    />
  );
}
