import { FaCheck } from "react-icons/fa6";
import { TableCell, TableRow } from "../../../Table/Table";
import React from "react";

export const DesktopBody = ({ props }) => {
  return (
    <TableRow>
      <TableCell>
        <span className="checkbox-container">
          <input
            className="checkbox-input"
            id={`checkbox-${props.item.id}`}
            type="checkbox"
            checked={props.checkedIds.includes(props.item.id)}
            onChange={() => {
              if (props.checkedIds.includes(props.item.id)) {
                props.setCheckedIds((prevIds) =>
                  prevIds.filter((id) => id !== props.item.id)
                );
              } else {
                props.setCheckedIds((prevIds) => [...prevIds, props.item.id]);
              }
            }}
          />
          <label htmlFor={`checkbox-${props.item.id}`}>
            <FaCheck />
          </label>
        </span>
      </TableCell>
      <TableCell minWidth={"7rem"}>{props.item.order_id}</TableCell>
      <TableCell className={"!p-2"} minWidth={"10rem"}>
        {props.item.sku}
      </TableCell>
      <TableCell minWidth={"15rem"}>{props.item.name}</TableCell>
      <TableCell minWidth={"7rem"}>
        <span className="relative flex items-center h-full w-[95%] overflow-hidden rounded-md">
          <span
            className="w-full z-10 p-2 absolute h-full top-0 left-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${props.item.swatch_url})`,
              backgroundSize: "100000%",
            }}></span>
          <span
            className="z-20 py-1 pl-2 rounded-md w-fit whitespace-nowrap relative"
            style={{
              color: props.item.swatch_text_color,
            }}>
            {props.item.color}
          </span>
        </span>
      </TableCell>
      <TableCell minWidth={"7rem"}>{props.item.size}</TableCell>
      <TableCell>{props.item.qty}</TableCell>
      <TableCell minWidth={"8rem"}>{props.item.date.split(" or")[0]}</TableCell>
      <TableCell className={"!p-0"}>
        {props.renderOptionsButton(props.item.id)}
      </TableCell>
    </TableRow>
  );
};
