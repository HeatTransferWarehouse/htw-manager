import React from "react";
import { twMerge } from "tailwind-merge";

export function PaginationSheet({ props }) {
  return (
    <div
      className={twMerge(
        "absolute left-6 w-[120px] shadow-default bg-white z-[999999] rounded-md overflow-hidden",
        props.position === "bottom" ? "bottom-12" : "top-12"
      )}>
      <ul className="w-full">
        <li
          className={twMerge(
            "cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary",
            props.rowsPerPage === 10 ? "bg-secondary/10 text-secondary" : ""
          )}
          onClick={() => {
            props.setRowsPerPage(10);
            props.setPage(0);
            props.setRowsPerPageOpen(false);
          }}>
          10
        </li>
        <li
          className={twMerge(
            "cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary",
            props.rowsPerPage === 25 ? "bg-secondary/10 text-secondary" : ""
          )}
          onClick={() => {
            props.setRowsPerPage(25);
            props.setPage(0);
            props.setRowsPerPageOpen(false);
          }}>
          25
        </li>
        <li
          className={twMerge(
            "cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary",
            props.rowsPerPage === 50 ? "bg-secondary/10 text-secondary" : ""
          )}
          onClick={() => {
            props.setRowsPerPage(50);
            props.setPage(0);
            props.setRowsPerPageOpen(false);
          }}>
          50
        </li>
        <li
          className={twMerge(
            "cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary",
            props.rowsPerPage === 100 ? "bg-secondary/10 text-secondary" : ""
          )}
          onClick={() => {
            props.setRowsPerPage(100);
            props.setPage(0);
            props.setRowsPerPageOpen(false);
          }}>
          100
        </li>
        {props.allowMax ? (
          <li
            className={twMerge(
              "cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary",
              props.rowsPerPage === 250 ? "bg-secondary/10 text-secondary" : ""
            )}
            onClick={() => {
              props.setRowsPerPage(250);
              props.setPage(0);
              props.setRowsPerPageOpen(false);
            }}>
            250
          </li>
        ) : (
          ""
        )}
      </ul>
    </div>
  );
}
