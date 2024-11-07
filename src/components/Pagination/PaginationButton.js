import React from "react";
import { FaCaretDown } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";

export function PaginationButton({ props }) {
  return (
    <button
      ref={props.rowsButtonRef}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        props.setRowsPerPageOpen(!props.rowsPerPageOpen);
        props.buttonClickedRef.current = true;
      }}
      className={twMerge(
        "rounded-md flex gap-1 items-center hover:bg-secondary/10 group/rows hover:text-secondary p-2 transition duration-200",
        props.rowsPerPageOpen && "bg-secondary/10 text-secondary"
      )}>
      <p>
        {props.page === 0 ? "1" : props.page * props.rowsPerPage + 1} -{" "}
        {props.page === 0
          ? props.rowsPerPage > props.items.length
            ? props.items.length
            : props.rowsPerPage
          : props.rowsPerPage * (props.page + 1) < props.items.length
          ? props.rowsPerPage * (props.page + 1)
          : props.items.length}
      </p>
      <span>of</span>
      <p>{props.items.length}</p>
      <FaCaretDown className="w-3 h-3 ml-2 " />
    </button>
  );
}
