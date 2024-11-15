import React from "react";
import { useLocation } from "react-router-dom";
import { TableNavLink } from "../../../ui/link";

export function TableNav({ count, props }) {
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
        active={view === "progress"}
        onClick={() => {
          props.setPage(0);
          props.setRowsPerPage(10);
          props.setCheckedIds([]);
        }}
        to={`${pathname}?view=progress`}>
        In Progress <span>({count.inProgressCount})</span>
      </TableNavLink>
      <TableNavLink
        active={view === "completed"}
        onClick={() => {
          props.setPage(0);
          props.setRowsPerPage(10);
          props.setCheckedIds([]);
        }}
        to={`${pathname}?view=completed`}>
        Completed <span>({count.completedCount})</span>
      </TableNavLink>
    </div>
  );
}
