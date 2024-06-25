import React from "react";
import { Link, useLocation } from "react-router-dom";
import { twMerge } from "tailwind-merge";

export function TableNav({ count, props }) {
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view") || "new"; // Default to 'new' if no parameter is present

  return (
    <div className="flex justify-center items-center w-full p-4 gap-2">
      <Link
        className={twMerge(
          "max-sm:w-1/3 max-sm:flex max-sm:flex-col rounded-md font-medium p-2 text-secondary   hover:text-white hover:bg-secondary ",
          view === "new" && "bg-secondary  text-white"
        )}
        onClick={() => {
          props.setPage(0);
          props.setRowsPerPage(10);
          props.setCheckedIds([]);
        }}
        to={`${pathname}?view=new`}>
        New <span>({count.newCount})</span>
      </Link>
      <Link
        className={twMerge(
          "max-sm:w-1/3 max-sm:flex max-sm:flex-col rounded-md font-medium p-2 text-secondary   hover:text-white hover:bg-secondary ",
          view === "progress" && "bg-secondary  text-white"
        )}
        onClick={() => {
          props.setPage(0);
          props.setRowsPerPage(10);
          props.setCheckedIds([]);
        }}
        to={`${pathname}?view=progress`}>
        In Progress <span>({count.inProgressCount})</span>
      </Link>
      <Link
        className={twMerge(
          "max-sm:w-1/3 max-sm:flex max-sm:flex-col rounded-md font-medium p-2 text-secondary   hover:text-white hover:bg-secondary ",
          view === "completed" && "bg-secondary  text-white"
        )}
        onClick={() => {
          props.setPage(0);
          props.setRowsPerPage(10);
          props.setCheckedIds([]);
        }}
        to={`${pathname}?view=completed`}>
        Completed <span>({count.completedCount})</span>
      </Link>
    </div>
  );
}
