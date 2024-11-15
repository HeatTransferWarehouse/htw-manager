import React from "react";
import { Link, useLocation } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { TableNavLink } from "../../../ui/link";

export function Nav({ count, props }) {
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view") || "new"; // Default to 'new' if no parameter is present

  return (
    <div className="flex justify-center items-center w-full p-4 gap-2">
      <TableNavLink
        active={view === "new"}
        onClick={() => {
          props.setPage(0);
          props.setRowsPerPage(10);
          props.setCheckedIds([]);
        }}
        to={`${pathname}?view=new`}>
        New <span>({count.newCount})</span>
      </TableNavLink>
      <TableNavLink
        active={view === "ordered"}
        onClick={() => {
          props.setPage(0);
          props.setRowsPerPage(10);
          props.setCheckedIds([]);
        }}
        to={`${pathname}?view=ordered`}>
        Ordered <span>({count.orderedCount})</span>
      </TableNavLink>
    </div>
  );
}
