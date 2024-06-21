import React, { useState, useEffect, useRef } from "react";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FaCheck } from "react-icons/fa";
import { TableBody, TableCell, TableRow } from "../../../Table/Table";
import { twMerge } from "tailwind-merge";
import { OptionsList } from "./option-list";

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
              <TableRow isMobile={props.isMobile} key={index}>
                <TableCell isMobile={index === 0 && props.isMobile}>
                  <span className="checkbox-container">
                    <input
                      style={{
                        margin: "0px",
                      }}
                      className="checkbox-input"
                      id={`checkbox-${item.id}`}
                      type="checkbox"
                      checked={props.checkedIds.includes(item.id)}
                      onChange={() => {
                        if (props.checkedIds.includes(item.id)) {
                          props.setCheckedIds((prevIds) =>
                            prevIds.filter((id) => id !== item.id)
                          );
                        } else {
                          props.setCheckedIds((prevIds) => [
                            ...prevIds,
                            item.id,
                          ]);
                        }
                      }}
                    />
                    <label htmlFor={`checkbox-${item.id}`}>
                      <FaCheck />
                    </label>
                  </span>
                </TableCell>
                <TableCell isMobile={index === 0 && props.isMobile}>
                  <div className="flex flex-col px-2">
                    <p className="py-2">{item.order_id}</p>
                    <p className="py-2 font-medium">{item.name}</p>
                    <p className="py-2">{item.sku}</p>
                    {item.options &&
                      item.options.map((option, index) => {
                        return (
                          <p key={index} className="py-2">
                            {option.name}: {option.value}
                          </p>
                        );
                      })}
                    <p className="py-2 absolute top-2 right-4">
                      x{item.quantity}
                    </p>
                    <p className="py-2 absolute bottom-2 right-4">
                      {item.date}
                    </p>
                  </div>
                </TableCell>
                <TableCell
                  isMobile={index === 0 && props.isMobile}
                  className={"!p-0"}>
                  {renderOptionsButton(item.id)}
                </TableCell>
              </TableRow>
            );
          } else {
            return (
              <TableRow tableFor={"clothing"} key={index}>
                <TableCell>
                  <span className="checkbox-container">
                    <input
                      style={{
                        margin: "0px",
                      }}
                      className="checkbox-input"
                      id={`checkbox-${item.id}`}
                      type="checkbox"
                      checked={props.checkedIds.includes(item.id)}
                      onChange={() => {
                        if (props.checkedIds.includes(item.id)) {
                          props.setCheckedIds((prevIds) =>
                            prevIds.filter((id) => id !== item.id)
                          );
                        } else {
                          props.setCheckedIds((prevIds) => [
                            ...prevIds,
                            item.id,
                          ]);
                        }
                      }}
                    />
                    <label htmlFor={`checkbox-${item.id}`}>
                      <FaCheck />
                    </label>
                  </span>
                </TableCell>
                <TableCell minWidth={"7rem"}>{item.order_id}</TableCell>
                <TableCell className={"!p-2"} minWidth={"10rem"}>
                  {item.sku}
                </TableCell>
                <TableCell minWidth={"15rem"}>{item.name}</TableCell>
                <TableCell minWidth={"7rem"}>
                  <span className="relative flex items-center h-full w-full overflow-hidden rounded-md">
                    <span
                      className="w-full z-10 p-2 absolute h-full top-0 left-0 bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage: `url(${item.swatch_url})`,
                        backgroundSize: "10000%",
                      }}></span>
                    <span className="z-20 bg-white/50 p-1 rounded-md w-fit whitespace-nowrap relative">
                      {item.color}
                    </span>
                  </span>
                </TableCell>
                <TableCell minWidth={"7rem"}>{item.size}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell minWidth={"8rem"}>{item.date}</TableCell>
                <TableCell className={"!p-0"}>
                  {renderOptionsButton(item.id)}
                </TableCell>
              </TableRow>
            );
          }
        })}
    </TableBody>
  );
}
