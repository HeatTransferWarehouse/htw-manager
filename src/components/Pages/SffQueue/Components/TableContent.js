import React, { useState, useEffect, useRef } from "react";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FaChevronDown, FaChevronUp, FaCheck } from "react-icons/fa";
import { useQueueActions } from "../Functions/queue-actions";
import { OptionsList } from "./OptionsList";
import { TableBody, TableCell, TableRow } from "../../../Table/Table";
import { twMerge } from "tailwind-merge";

export function TableContent({ props }) {
  const { updateQueueItemPriority } = useQueueActions();
  const [activeItemId, setActiveItemId] = useState(null);
  const [activeItemPriorityId, setActiveItemPriorityId] = useState(null);
  const optionsRef = useRef(null);
  const priorityRef = useRef(null);
  const buttonClickedRef = useRef(false);
  const [elWidth, setElWidth] = useState(0);
  const [elTop, setElTop] = useState(0);
  const [elRight, setElRight] = useState(0);
  const [currentEl, setCurrentEl] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (currentEl) {
        setElTop(Number(currentEl.getBoundingClientRect().top.toFixed(0)));
        setElRight(Number(currentEl.getBoundingClientRect().right.toFixed(0)));
        setElWidth(Number(currentEl.getBoundingClientRect().width.toFixed(0)));
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonClickedRef.current) {
        buttonClickedRef.current = false;
        return;
      }

      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setActiveItemId(null);
        setElWidth(0);
        setElTop(0);
        setElRight(0);
        setCurrentEl(null);
      }

      if (priorityRef.current && !priorityRef.current.contains(event.target)) {
        setActiveItemPriorityId(null);
        setElWidth(0);
        setElTop(0);
        setElRight(0);
        setCurrentEl(null);
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
          setActiveItemPriorityId(null);
          setActiveItemId(activeItemId === itemId ? null : itemId);
          setCurrentEl(e.target);
          setElWidth(Number(e.target.getBoundingClientRect().width.toFixed(0)));
          setElTop(Number(e.target.getBoundingClientRect().top.toFixed(0)));
          setElRight(Number(e.target.getBoundingClientRect().right.toFixed(0)));
        }}>
        <BiDotsHorizontalRounded
          className={twMerge(
            "group-hover/options:fill-secondary transition duration-200 w-6 h-6",
            activeItemId === itemId ? "fill-secondary" : "fill-black"
          )}
        />
      </button>
      {activeItemId === itemId && (
        <div
          style={{
            top: `${elTop + 36}px`,
            left: `${elRight - 115}px`,
            width: `120px`,
          }}
          className="fixed bg-white shadow-default overflow-hidden rounded-md z-[99999]">
          <OptionsList props={{ view: props.view, id: itemId }} />
        </div>
      )}
    </div>
  );

  const renderPriorityButton = (item) => (
    <div className="w-full" ref={priorityRef}>
      <button
        className={`border-none group/priority hover:bg-secondary/10 hover:text-secondary rounded-md transition px-2 duration-200 items-center flex justify-between w-full gap-1 py-2 ${
          activeItemPriorityId === item.id
            ? "text-secondary bg-secondary/10"
            : ""
        }`}
        onClick={(e) => {
          setActiveItemId(null);
          setActiveItemPriorityId(
            activeItemPriorityId === item.id ? null : item.id
          );
          setCurrentEl(e.target);
          setElWidth(Number(e.target.getBoundingClientRect().width.toFixed(0)));
          setElTop(Number(e.target.getBoundingClientRect().top.toFixed(0)));
          setElRight(Number(e.target.getBoundingClientRect().right.toFixed(0)));

          buttonClickedRef.current = true;
        }}>
        {item.priority}
        {activeItemPriorityId === item.id ? (
          <FaChevronUp className="opacity-0 transition duration-200 group-hover/priority:opacity-100 fill-secondary" />
        ) : (
          <FaChevronDown className="opacity-0 transition duration-200 group-hover/priority:opacity-100 fill-secondary" />
        )}
      </button>
      {activeItemPriorityId === item.id && (
        <ul
          style={{
            top: `${elTop + 48}px`,
            left: `${elRight - elWidth}px`,
            width: `120px`,
          }}
          className="fixed bg-white shadow-default rounded-md z-[99999]">
          <li
            className="cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary"
            onClick={(e) => {
              updateQueueItemPriority(e, item.id, "low");
              setElWidth(0);
              setElTop(0);
              setElRight(0);
              setCurrentEl(null);
            }}>
            Low
          </li>
          <li
            className="cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary"
            onClick={(e) => {
              updateQueueItemPriority(e, item.id, "med");
              setElWidth(0);
              setElTop(0);
              setElRight(0);
              setCurrentEl(null);
            }}>
            Medium
          </li>
          <li
            className="cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary"
            onClick={(e) => {
              updateQueueItemPriority(e, item.id, "high");
              setElWidth(0);
              setElTop(0);
              setElRight(0);
              setCurrentEl(null);
            }}>
            High
          </li>
        </ul>
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
                    <span className="py-2">
                      <span className="font-medium">Order #</span>:{" "}
                      {item.order_number}
                    </span>
                    <span className="py-2">
                      <span className="font-medium">Sku</span>: {item.sku}
                    </span>
                    <span className="py-2">
                      <span className="font-medium">Name</span>:{" "}
                      {item.description}
                    </span>
                    <span className="py-2">
                      <ul className="flex m-0 flex-col">
                        {item.product_options.map((option, index) => (
                          <li key={index}>
                            <span className="font-medium">
                              {option.option_name}
                            </span>
                            : {option.option_value}
                          </li>
                        ))}
                      </ul>
                    </span>
                    <span className="py-2">
                      <span className="font-medium">Qty</span>: {item.qty}
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium">Priority</span>:{" "}
                      {renderPriorityButton(item)}
                    </span>
                    <span className="py-2">
                      <span className="font-medium">Created At</span>:{" "}
                      {item.created_at.split("T")[0]}
                    </span>
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
              <TableRow key={index}>
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
                <TableCell minWidth={"7rem"}>{item.order_number}</TableCell>
                <TableCell className={"!p-2"} minWidth={"10rem"}>
                  {item.sku}
                </TableCell>
                <TableCell minWidth={"15rem"}>{item.description}</TableCell>
                <TableCell className={"!pl-0"} minWidth={"15rem"}>
                  <ul className="flex m-0 flex-col">
                    {item.product_options.map((option, index) => (
                      <li key={index}>
                        <span className="font-medium">
                          {option.option_name}
                        </span>
                        : {option.option_value}
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>{item.qty}</TableCell>
                <TableCell className={"!p-2"} minWidth={"5rem"}>
                  {renderPriorityButton(item)}
                </TableCell>
                <TableCell minWidth={"8rem"}>
                  {item.created_at.split("T")[0]}
                </TableCell>
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
