import { twMerge } from "tailwind-merge";
import { Pagination } from "../../../Pagination/Pagination";
import React from "react";

export default function TableHeaderContainer({ props }) {
  console.log(props);

  return (
    <div
      className={twMerge(
        "flex justify-between items-center py-2 border-t border-b border-solid border-gray-200"
      )}>
      <Pagination
        props={{
          view: props.view,
          items: props.items,
          rowsPerPage: props.rowsPerPage,
          setRowsPerPage: props.setRowsPerPage,
          page: props.page,
          setPage: props.setPage,
          allowMax: true,
        }}
      />
    </div>
  );
}
