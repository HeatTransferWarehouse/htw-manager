import React from "react";
import { TableCell, TableRow } from "../../../Table/Table";
import { FaCheck } from "react-icons/fa6";

export function MobileBody({ props }) {
  return (
    <TableRow isMobile={props.isMobile}>
      <TableCell isMobile={props.index === 0 && props.isMobile}>
        <span className="checkbox-container">
          <input
            style={{
              margin: "0px",
            }}
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
      <TableCell isMobile={props.index === 0 && props.isMobile}>
        <div className="flex flex-col px-2">
          <p className="py-2">{props.item.order_id}</p>
          <p className="py-2 font-medium">{props.item.name}</p>
          <p className="py-2">{props.item.sku}</p>
          <p className="py-2">
            <span className="relative flex items-center h-full w-full overflow-hidden rounded-md">
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
          </p>
          <p className="py-2">Size {props.item.size}</p>
          <p className="py-2 absolute top-2 right-4">x{props.item.qty}</p>
          <p className="py-2 absolute bottom-2 right-4">
            {props.item.date.split(" or")[0]}
          </p>
        </div>
      </TableCell>
      <TableCell
        isMobile={props.index === 0 && props.isMobile}
        className={"!p-0"}>
        {props.renderOptionsButton(props.item.id)}
      </TableCell>
    </TableRow>
  );
}
