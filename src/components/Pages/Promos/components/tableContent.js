import React from "react";
import { TableBody, TableCell, TableRow } from "../../../Table/Table";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";
import { Link, useLocation } from "react-router-dom";

export function TableContent({ props }) {
  const location = useLocation();
  const pathname = location.pathname;
  const renderLoadingRow = (index) => (
    <TableRow tableFor={"promos"} className="loading-row" key={index}>
      {Array(6)
        .fill(null)
        .map((_, cellIndex) => (
          <TableCell
            minWidth={
              cellIndex === 4 || cellIndex === 5
                ? "7rem"
                : cellIndex === 0
                ? "5rem"
                : "10rem"
            }
            key={cellIndex}>
            <span className="loading-cell" />
          </TableCell>
        ))}
    </TableRow>
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
        <p className="text-2xl">No Items to show</p>
      </div>
    );
  }

  return (
    <TableBody>
      {props.items.map((item, index) => {
        const startDate = format(new Date(item.start_date), "yyyy/MM/dd");
        const endDate = item.end_date
          ? format(new Date(item.end_date), "yyyy/MM/dd")
          : "Not Specified";

        return (
          <TableRow tableFor={"promos"} key={index}>
            <TableCell minWidth={"5rem"}>{item.id}</TableCell>
            <TableCell minWidth={"10rem"}>{item.name}</TableCell>
            <TableCell minWidth={"10rem"}>{startDate}</TableCell>
            <TableCell className={"!p-2"} minWidth={"10rem"}>
              {endDate}
            </TableCell>
            <TableCell
              className={twMerge(
                "!p-2 font-semibold",
                item.status.toLowerCase() === "enabled"
                  ? "text-green-600"
                  : "text-red-600"
              )}
              minWidth={"7rem"}>
              {item.status}
            </TableCell>
            <TableCell minWidth={"7rem"}>
              <Link
                className={twMerge(
                  "max-sm:w-1/3 max-sm:flex max-sm:flex-col rounded-md font-medium p-2 text-secondary hover:text-white hover:bg-secondary"
                )}
                to={`${pathname}/${item.id}`}>
                Details
              </Link>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
}
