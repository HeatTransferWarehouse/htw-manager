import React, { useState, useEffect, useRef } from "react";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { TableBody, TableCell, TableRow } from "../../../Table/Table";
import { twMerge } from "tailwind-merge";
import { OptionsList } from "./option-list";
import { DesktopBody } from "./desktop-body";
import { MobileBody } from "./mobile-body";

export function TableContent({ props }) {
  const [activeItemId, setActiveItemId] = useState(null);
  const optionsRef = useRef(null);
  const buttonClickedRef = useRef(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonClickedRef.current) {
        buttonClickedRef.current = false;
        return;
      }

      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setActiveItemId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const renderLoadingRow = (index) => (
    <TableRow className="loading-row" key={index}>
      {props.isMobile ? (
        <>
          <TableCell>
            <span className="loading-cell" />
          </TableCell>
          <TableCell />
        </>
      ) : (
        Array(9)
          .fill(null)
          .map((_, cellIndex) => (
            <TableCell key={cellIndex}>
              <span className="loading-cell" />
            </TableCell>
          ))
      )}
    </TableRow>
  );

  const renderOptionsButton = (itemId) => (
    <div className="options-container" ref={optionsRef}>
      <button
        aria-label="Open Options"
        className={twMerge(
          "w-8 h-8 flex items-center justify-center border-none rounded-md transition duration-200 hover:bg-secondary/10 group/options",
          activeItemId === itemId && "bg-secondary/10"
        )}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          buttonClickedRef.current = true;
          setActiveItemId(activeItemId === itemId ? null : itemId);
          props.setSingleCheckedId(itemId);
        }}>
        <BiDotsHorizontalRounded
          className={twMerge(
            "group-hover/options:fill-secondary transition duration-200 w-6 h-6",
            activeItemId === itemId ? "fill-secondary" : "fill-black"
          )}
        />
      </button>
      {activeItemId === itemId && (
        <div className="absolute top-10 w-fit right-0 bg-white shadow-default overflow-hidden rounded-md z-[99999]">
          <OptionsList
            props={{
              view: props.view,
              id: itemId,
              setDeleteModalActive: props.setDeleteModalActive,
            }}
          />
        </div>
      )}
    </div>
  );

  if (props.itemsLoading) {
    return (
      <TableBody>
        {Array.from({ length: 10 }).map((_, index) => renderLoadingRow(index))}
      </TableBody>
    );
  }

  if (props.items.length === 0) {
    return (
      <div className="w-full flex items-center py-8 justify-center">
        <p className="text-2xl">No Items to show for {props.date}</p>
      </div>
    );
  }

  return (
    <TableBody>
      {props.items
        .slice(
          props.page * props.rowsPerPage,
          props.page * props.rowsPerPage + props.rowsPerPage
        )
        .map((item, index) => {
          if (props.isMobile) {
            return (
              <MobileBody
                key={index}
                props={{
                  item,
                  renderOptionsButton,
                  checkedIds: props.checkedIds,
                  setCheckedIds: props.setCheckedIds,
                  index,
                  isMobile: props.isMobile,
                }}
              />
            );
          } else {
            return (
              <DesktopBody
                key={index}
                props={{
                  item,
                  checkedIds: props.checkedIds,
                  setCheckedIds: props.setCheckedIds,
                  renderOptionsButton,
                }}
              />
            );
          }
        })}
    </TableBody>
  );
}
