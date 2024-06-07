import React, { useState } from "react";
import TableBody from "@material-ui/core/TableBody";
import { TableCell, TableRow } from "@material-ui/core";
import { FaPlay } from "react-icons/fa";
import { useDispatch } from "react-redux";

export function TableContent({ props }) {
  const dispatch = useDispatch();

  const startItem = (e, id) => {
    e.preventDefault();
    dispatch({ type: "START_QUEUE_ITEM", payload: id });
  };
  return (
    <TableBody>
      {props.items.map((item, index) => (
        <TableRow key={index}>
          <TableCell>
            <input
              className="checkbox-input"
              type="checkbox"
              checked={props.checkedIds.includes(item.id)}
              onChange={() => {
                if (props.checkedIds.includes(item.id)) {
                  props.setCheckedIds((prevIds) =>
                    prevIds.filter((id) => id !== item.id)
                  );
                } else {
                  props.setCheckedIds((prevIds) => [...prevIds, item.id]);
                }
              }}
            />
          </TableCell>
          <TableCell>{item.order_number}</TableCell>
          <TableCell>{item.sku}</TableCell>
          <TableCell>{item.description}</TableCell>
          <TableCell>
            <span>
              {item.product_options.map((option, index) => (
                <p key={index}>
                  <span className="option-name">{option.option_name}:</span>
                  {option.option_value}
                </p>
              ))}
            </span>
          </TableCell>
          <TableCell>{item.qty}</TableCell>
          <TableCell>{item.created_at.split("T")[0]}</TableCell>
          {props.view === "new" && (
            <TableCell>
              <button
                className="queue-start"
                onClick={(e) => startItem(e, item.id)}>
                <FaPlay color="white" />
              </button>
            </TableCell>
          )}
        </TableRow>
      ))}
    </TableBody>
  );
}
