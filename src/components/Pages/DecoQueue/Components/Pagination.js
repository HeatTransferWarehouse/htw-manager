import React, { useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight, FaCaretDown } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";

export function Pagination({ props }) {
  const rowsButtonRef = useRef(null);
  const buttonClickedRef = useRef(false);
  const [buttonTop, setButtonTop] = React.useState(0);
  const [buttonRight, setButtonRight] = React.useState(0);
  const [rowsPerPageOpen, setRowsPerPageOpen] = React.useState(false);
  const [nextIsDisabled, setNextIsDisabled] = React.useState(false);
  const [buttonWidth, setButtonWidth] = React.useState(0);

  useEffect(() => {
    if (props.items.length > props.rowsPerPage * (props.page + 1)) {
      setNextIsDisabled(false);
    } else if (props.items.length <= props.rowsPerPage * (props.page + 1)) {
      setNextIsDisabled(true);
    }
  }, [props.rowsPerPage, props.page, props.items.length]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonClickedRef.current) {
        buttonClickedRef.current = false;
        return;
      }

      if (
        rowsButtonRef.current &&
        !rowsButtonRef.current.contains(event.target)
      ) {
        setRowsPerPageOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (rowsButtonRef.current) {
        if (props.position === "bottom") {
          setButtonTop(
            Number(
              rowsButtonRef.current.getBoundingClientRect().top.toFixed(0)
            ) - 168
          );
        } else {
          setButtonTop(
            Number(
              rowsButtonRef.current.getBoundingClientRect().top.toFixed(0)
            ) + 46
          );
        }

        setButtonWidth(
          Number(rowsButtonRef.current.getBoundingClientRect().width.toFixed(0))
        );
        setButtonRight(
          rowsButtonRef.current.getBoundingClientRect().right.toFixed(0) -
            buttonWidth
        );
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);

    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  });

  return (
    <div
      className={twMerge(
        "px-1 py-2 flex justify-end items-center grow gap-2",
        props.position === "bottom"
          ? "border-t border-solid border-gray-200"
          : ""
      )}>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          {rowsPerPageOpen && (
            <div
              style={{
                top: `${buttonTop}px`,
                left: `${buttonRight}px`,
                width: `${buttonWidth}px`,
              }}
              className={twMerge(
                "fixed shadow-default bg-white z-[999999] rounded-md overflow-hidden"
              )}>
              <ul className="w-full">
                <li
                  className={twMerge(
                    "cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary",
                    props.rowsPerPage === 10
                      ? "bg-secondary/10 text-secondary"
                      : ""
                  )}
                  onClick={() => {
                    props.setRowsPerPage(10);
                    props.setPage(0);
                    setRowsPerPageOpen(false);
                  }}>
                  10
                </li>
                <li
                  className={twMerge(
                    "cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary",
                    props.rowsPerPage === 25
                      ? "bg-secondary/10 text-secondary"
                      : ""
                  )}
                  onClick={() => {
                    props.setRowsPerPage(25);
                    props.setPage(0);
                    setRowsPerPageOpen(false);
                  }}>
                  25
                </li>
                <li
                  className={twMerge(
                    "cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary",
                    props.rowsPerPage === 50
                      ? "bg-secondary/10 text-secondary"
                      : ""
                  )}
                  onClick={() => {
                    props.setRowsPerPage(50);
                    props.setPage(0);
                    setRowsPerPageOpen(false);
                  }}>
                  50
                </li>
                <li
                  className={twMerge(
                    "cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary",
                    props.rowsPerPage === 100
                      ? "bg-secondary/10 text-secondary"
                      : ""
                  )}
                  onClick={() => {
                    props.setRowsPerPage(100);
                    props.setPage(0);
                    setRowsPerPageOpen(false);
                  }}>
                  100
                </li>
              </ul>
            </div>
          )}
        </div>
        <button
          ref={rowsButtonRef}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setRowsPerPageOpen(!rowsPerPageOpen);
            buttonClickedRef.current = true;
          }}
          className="rounded-md flex gap-1 items-center hover:bg-secondary/10 group/rows hover:text-secondary p-2 transition duration-200">
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
              !nextIsDisabled
                ? "cursor-pointer hover:bg-secondary/10 group/pag-next"
                : "cursor-not-allowed"
            )}
            disabled={nextIsDisabled}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              props.setPage(props.page + 1);
            }}>
            <FaChevronRight
              className={twMerge(
                "w-4 h-4 transition duration-200 ",
                nextIsDisabled
                  ? "fill-gray-400"
                  : "group-hover/pag-next:fill-secondary"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
