import React, { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { PaginationButton } from "./PaginationButton";
import { PaginationSheet } from "./PaginationSheet";
import { PaginationControls } from "./PaginationContols";

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
            <PaginationSheet
              props={{
                ...props,
                buttonTop,
                buttonRight,
                buttonWidth,
                setRowsPerPageOpen,
              }}
            />
          )}
        </div>
        <PaginationButton
          props={{
            ...props,
            rowsButtonRef,
            buttonClickedRef,
            setRowsPerPageOpen,
            rowsPerPageOpen,
          }}
        />
        <PaginationControls props={{ ...props, nextIsDisabled }} />
      </div>
    </div>
  );
}
