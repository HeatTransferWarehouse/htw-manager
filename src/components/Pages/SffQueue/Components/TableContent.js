import React, { useState, useEffect, useRef } from "react";
import TableBody from "@material-ui/core/TableBody";
import { TableCell, TableRow } from "@material-ui/core";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useQueueActions } from "../Functions/queue-actions";
import { OptionsList } from "./OptionsList";
import { FaCheck } from "react-icons/fa";

export function TableContent({ props }) {
  const { updateQueueItemPriority } = useQueueActions();
  const [activeItemId, setActiveItemId] = useState(null);
  const [activeItemOptions, setActiveItemOptions] = useState(false);
  const [activeItemPriorityId, setActiveItemPriorityId] = useState(null); // Add a state to hold the active item's priority
  const buttonClickedRef = useRef(false);
  const priorityRef = useRef(null); // Create a ref to hold the priority container
  const priorityButtonRef = useRef(null); // Create a ref to hold the priority button
  const optionsRef = useRef(null); // Create a ref to hold the options container

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonClickedRef.current) {
        buttonClickedRef.current = false;
        return;
      } else if (priorityButtonRef.current) {
        priorityButtonRef.current = false;
        return;
      }

      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setActiveItemId(null);
      }

      if (priorityRef.current && !priorityRef.current.contains(event.target)) {
        setActiveItemPriorityId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  if (props.itemsLoading) {
    return (
      <TableBody>
        {Array.from({ length: 10 }).map((_, index) => (
          <TableRow className="loading-row" key={index}>
            {props.isMobile ? (
              <>
                <TableCell>
                  <span className="loading-cell" />
                </TableCell>
                <TableCell></TableCell>
              </>
            ) : (
              <>
                <TableCell></TableCell>
                <TableCell>
                  <span className="loading-cell" />
                </TableCell>
                <TableCell>
                  <span className="loading-cell" />
                </TableCell>
                <TableCell>
                  <span className="loading-cell" />
                </TableCell>
                <TableCell>
                  <span className="loading-cell" />
                </TableCell>
                <TableCell>
                  <span className="loading-cell" />
                </TableCell>
                <TableCell>
                  <span className="loading-cell" />
                </TableCell>
                <TableCell>
                  <span className="loading-cell" />
                </TableCell>
                <TableCell></TableCell>
              </>
            )}
          </TableRow>
        ))}
      </TableBody>
    );
  }

  return (
    <TableBody className="sff-queue-tb">
      {props.items
        .slice(
          props.page * props.rowsPerPage,
          props.page * props.rowsPerPage + props.rowsPerPage
        )
        .map((item, index) => (
          <TableRow
            className={
              item.priority === "high"
                ? "high-priority"
                : item.priority === "med"
                ? "med-priority"
                : "low-priority"
            }
            style={
              props.checkedIds.includes(item.id)
                ? {
                    backgroundColor: "#f0f0f0",
                  }
                : {}
            }
            key={index}>
            {props.isMobile ? (
              <>
                <TableCell>
                  <ul className="mobile-options-list">
                    <li className="mobile-options-item">
                      <span className="bold">Order #</span>: {item.order_number}
                    </li>
                    <li className="mobile-options-item">
                      <span className="bold">Product</span>: {item.description}
                    </li>
                    <li className="mobile-options-item">
                      <span className="bold">Sku</span>: {item.sku}
                    </li>
                    <li className="mobile-options-item">
                      <span className="bold">Qty</span>: {item.qty}
                    </li>
                    <li className="mobile-options-item">
                      <span className="bold">Priority</span>: {item.priority}
                    </li>
                    <li className="mobile-options-item">
                      <span className="bold">Created At</span>:{" "}
                      {item.created_at.split("T")[0]}
                    </li>
                    <li className="mobile-options-item">
                      <span
                        className="bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setActiveItemOptions(
                            activeItemOptions === item.id ? null : item.id
                          );
                        }}>
                        Product Options{" "}
                        {activeItemOptions === item.id ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </span>
                      {activeItemOptions === item.id && (
                        <div
                          style={{
                            paddingLeft: "1rem",
                            paddingTop: "0.75rem",
                          }}>
                          {item.product_options.map((option, index) => (
                            <p
                              style={{
                                paddingBlock: "0.25rem",
                              }}
                              key={index}>
                              <span className="option-name">
                                {option.option_name}:
                              </span>
                              {option.option_value}
                            </p>
                          ))}
                        </div>
                      )}
                    </li>
                  </ul>
                </TableCell>
                <TableCell>
                  <div className="options-container" ref={optionsRef}>
                    <button
                      className={`queue-options ${
                        activeItemId === item.id && `active`
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        buttonClickedRef.current = true; // Set the ref to indicate a button click
                        setActiveItemId(
                          activeItemId === item.id ? null : item.id
                        );
                      }}>
                      <BiDotsHorizontalRounded
                        style={{
                          width: "1.25rem",
                          height: "1.25rem",
                        }}
                        fill="black"
                      />
                    </button>
                    {activeItemId === item.id && (
                      <OptionsList props={{ view: props.view, id: item.id }} />
                    )}
                  </div>
                </TableCell>
              </>
            ) : (
              <>
                <TableCell
                  style={{
                    minWidth: "3rem",
                    maxWidth: "3rem",
                    padding: 0,
                  }}>
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
                <TableCell>{item.order_number}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <span>
                    {item.product_options.map((option, index) => (
                      <p key={index}>
                        <span className="option-name">
                          {option.option_name}:
                        </span>
                        {option.option_value}
                      </p>
                    ))}
                  </span>
                </TableCell>
                <TableCell>{item.qty}</TableCell>
                <TableCell>
                  <div className="options-container priority" ref={priorityRef}>
                    <button
                      className={`priority-button ${
                        activeItemPriorityId === item.id && "active"
                      }`}
                      onClick={() => {
                        setActiveItemPriorityId(
                          activeItemPriorityId === item.id ? null : item.id
                        );
                        priorityButtonRef.current = true;
                      }}>
                      {item.priority}
                      {activeItemPriorityId === item.id ? (
                        <FaChevronUp
                          className={
                            activeItemPriorityId === item.id && "active"
                          }
                        />
                      ) : (
                        <FaChevronDown />
                      )}
                    </button>
                    {activeItemPriorityId === item.id && (
                      <ul className="options-list">
                        <li
                          onClick={(e) =>
                            updateQueueItemPriority(e, item.id, "low")
                          }>
                          Low
                        </li>
                        <li
                          onClick={(e) =>
                            updateQueueItemPriority(e, item.id, "med")
                          }>
                          Medium
                        </li>
                        <li
                          onClick={(e) =>
                            updateQueueItemPriority(e, item.id, "high")
                          }>
                          High
                        </li>
                      </ul>
                    )}
                  </div>
                </TableCell>
                <TableCell>{item.created_at.split("T")[0]}</TableCell>
                <TableCell>
                  <div className="options-container" ref={optionsRef}>
                    <button
                      className={`queue-options ${
                        activeItemId === item.id && `active`
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        buttonClickedRef.current = true; // Set the ref to indicate a button click
                        setActiveItemId(
                          activeItemId === item.id ? null : item.id
                        );
                      }}>
                      <BiDotsHorizontalRounded
                        style={{
                          width: "1.25rem",
                          height: "1.25rem",
                        }}
                        fill="black"
                      />
                    </button>
                    {activeItemId === item.id && (
                      <OptionsList props={{ view: props.view, id: item.id }} />
                    )}
                  </div>
                </TableCell>
              </>
            )}
          </TableRow>
        ))}
    </TableBody>
  );
}
