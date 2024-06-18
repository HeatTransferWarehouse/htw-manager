import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

export function PaginationControls({ props }) {
  return (
    <div className="flex items-center gap-1">
      <button
        className={twMerge(
          "p-3 rounded-full transition duration-200 ",
          props.page === 0
            ? "cursor-not-allowed"
            : "hover:bg-secondary/10 group/pag-next"
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          props.setPage(props.page - 1);
        }}
        disabled={props.page === 0}>
        <FaChevronLeft
          className={twMerge(
            "w-4 h-4 transition duration-200 ",
            props.page === 0
              ? "fill-gray-400"
              : "group-hover/pag-next:fill-secondary"
          )}
        />
      </button>
      <button
        className={twMerge(
          "p-3 rounded-full transition duration-200 ",
          !props.nextIsDisabled
            ? "cursor-pointer hover:bg-secondary/10 group/pag-next"
            : "cursor-not-allowed"
        )}
        disabled={props.nextIsDisabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          props.setPage(props.page + 1);
        }}>
        <FaChevronRight
          className={twMerge(
            "w-4 h-4 transition duration-200 ",
            props.nextIsDisabled
              ? "fill-gray-400"
              : "group-hover/pag-next:fill-secondary"
          )}
        />
      </button>
    </div>
  );
}
