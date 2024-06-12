import React, { useState, useEffect, useRef } from "react";
import TableBody from "@material-ui/core/TableBody";
import { TableCell, TableRow } from "@material-ui/core";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FaChevronDown, FaChevronUp, FaCheck } from "react-icons/fa";
import { useQueueActions } from "../Functions/queue-actions";
import { OptionsList } from "./OptionsList";

export function TableContent({ props }) {
  const { updateQueueItemPriority } = useQueueActions();
  const [activeItemId, setActiveItemId] = useState(null);
  const [activeItemPriorityId, setActiveItemPriorityId] = useState(null);
  const optionsRef = useRef(null);
  const priorityRef = useRef(null);
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

      if (priorityRef.current && !priorityRef.current.contains(event.target)) {
        setActiveItemPriorityId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const getColor = (item) => {
    const { sku, description } = item;
    const decoSku3 = sku.slice(0, 6);
    const decoSku5 = sku.slice(0, 3);
    const decoSku7 = sku.slice(0, 7);
    const decoSku6 = sku.slice(0, 8);

    if (
      ["SD1", "SD2", "SD3", "SD4", "SD5", "SD6", "SD7", "SD8", "SD9"].includes(
        decoSku5
      ) ||
      decoSku6 === "SETUPFEE" ||
      description.includes("Rhinestone Bundle")
    ) {
      return "#F7B665";
    } else if (sku.startsWith("STOCK-")) {
      return "rgb(200 142 213)";
    } else if (
      ["CS1", "CS2", "CS3", "CS4", "CS5", "CS6", "CS7", "CS8", "CS9"].includes(
        decoSku5
      ) ||
      decoSku6 === "CUSTOM-S" ||
      description.includes("Pattern Vinyl Sheet and Mask Bundle")
    ) {
      return "#90CA6D";
    } else if (
      [
        "SISER-1",
        "SISER-2",
        "SISER-3",
        "SISER-4",
        "SISER-5",
        "SISER-6",
        "SISER-7",
        "SISER-8",
        "SISER-9",
      ].includes(decoSku7)
    ) {
      return "#F8F18A";
    } else if (
      ["CD1", "CD2", "CD3", "CD4", "CD5", "CD6", "CD7", "CD8", "CD9"].includes(
        decoSku5
      ) ||
      decoSku6 === "CUSTOM-H" ||
      sku.startsWith("PHTVSTOCK-")
    ) {
      return "#EEB7D2";
    } else if (decoSku5 === "SDC") {
      return "#F48267";
    } else if (["SUBPAT"].includes(decoSku3) || sku.startsWith("SUBSTOCK-")) {
      return "#7AD7F0";
    }
    return "white";
  };

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
        className={`queue-options ${activeItemId === itemId ? "active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          buttonClickedRef.current = true;
          setActiveItemId(activeItemId === itemId ? null : itemId);
        }}>
        <BiDotsHorizontalRounded className="options-icon" />
      </button>
      {activeItemId === itemId && (
        <OptionsList props={{ view: props.view, id: itemId }} />
      )}
    </div>
  );

  const renderPriorityButton = (item) => (
    <div className="options-container priority" ref={priorityRef}>
      <button
        className={`priority-button ${
          activeItemPriorityId === item.id ? "active" : ""
        }`}
        onClick={() => {
          setActiveItemPriorityId(
            activeItemPriorityId === item.id ? null : item.id
          );
          buttonClickedRef.current = true;
        }}>
        {item.priority}
        {activeItemPriorityId === item.id ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      {activeItemPriorityId === item.id && (
        <ul className="options-list">
          <li onClick={(e) => updateQueueItemPriority(e, item.id, "low")}>
            Low
          </li>
          <li onClick={(e) => updateQueueItemPriority(e, item.id, "med")}>
            Medium
          </li>
          <li onClick={(e) => updateQueueItemPriority(e, item.id, "high")}>
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
    <TableBody className="sff-queue-tb">
      {props.items
        .slice(
          props.page * props.rowsPerPage,
          props.page * props.rowsPerPage + props.rowsPerPage
        )
        .map((item, index) => {
          const color = getColor(item);

          return (
            <TableRow
              className={`
                ${item.priority}-priority
                ${props.checkedIds.includes(item.id) ? "checked" : ""}
              `}
              key={index}>
              {props.isMobile ? (
                <>
                  <TableCell>
                    <ul className="mobile-options-list">
                      <li>
                        <span className="bold">Order #</span>:{" "}
                        {item.order_number}
                      </li>
                      <li>
                        <span className="bold">Product</span>:{" "}
                        {item.description}
                      </li>
                      <li>
                        <span className="bold">Sku</span>: {item.sku}
                      </li>
                      <li>
                        <span className="bold">Qty</span>: {item.qty}
                      </li>
                      <li>
                        <span className="bold">Priority</span>: {item.priority}
                      </li>
                      <li>
                        <span className="bold">Created At</span>:{" "}
                        {item.created_at.split("T")[0]}
                      </li>
                      <li>
                        <span className="bold">
                          Product Options {item.product_options}
                        </span>
                      </li>
                    </ul>
                  </TableCell>
                  <TableCell>{renderOptionsButton(item.id)}</TableCell>
                </>
              ) : (
                <>
                  <TableCell className="checkbox-cell">
                    <span className="checkbox-container">
                      <input
                        className="checkbox-input"
                        id={`checkbox-${item.id}`}
                        type="checkbox"
                        checked={props.checkedIds.includes(item.id)}
                        onChange={() => {
                          props.checkedIds.includes(item.id)
                            ? props.setCheckedIds((prev) =>
                                prev.filter((id) => id !== item.id)
                              )
                            : props.setCheckedIds((prev) => [...prev, item.id]);
                        }}
                      />
                      <label htmlFor={`checkbox-${item.id}`}>
                        <FaCheck />
                      </label>
                    </span>
                  </TableCell>
                  <TableCell>{item.order_number}</TableCell>
                  <TableCell>
                    <span
                      className="sku-cell"
                      style={{ backgroundColor: color }}>
                      {item.sku}
                    </span>
                  </TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.product_length}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>{renderPriorityButton(item)}</TableCell>
                  <TableCell>{item.created_at.split("T")[0]}</TableCell>
                  <TableCell>{renderOptionsButton(item.id)}</TableCell>
                </>
              )}
            </TableRow>
          );
        })}
    </TableBody>
  );
}
