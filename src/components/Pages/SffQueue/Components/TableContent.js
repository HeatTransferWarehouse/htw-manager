import React, { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { useQueueActions } from "../Functions/queue-actions";
import OptionsButton from "./OptionsButton";
import { TableBody, TableCell, TableRow } from "../../../Table/Table";
import {
  DropDownContainer,
  DropDownContent,
  DropDownItem,
  DropDownTrigger,
} from "../../../ui/dropdown";

export function TableContent({ props }) {
  const { updateQueueItemPriority } = useQueueActions();
  const [activeItemId, setActiveItemId] = useState(null);
  const [activeItemPriorityId, setActiveItemPriorityId] = useState(null);

  const renderLoadingRow = (index) => (
    <TableRow tableFor={"sff"} className="loading-row" key={index}>
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

  const renderPriorityButton = (item) => {
    return (
      <DropDownContainer type="click">
        <DropDownTrigger
          onClick={(e) => {
            setActiveItemId(null);
            setActiveItemPriorityId(
              activeItemPriorityId === item.id ? null : item.id
            );
          }}>
          {item.priority}
        </DropDownTrigger>
        <DropDownContent>
          <DropDownItem
            onClick={(e) => {
              updateQueueItemPriority(e, item.id, "low");
            }}>
            Low
          </DropDownItem>
          <DropDownItem
            onClick={(e) => {
              updateQueueItemPriority(e, item.id, "med");
            }}>
            Medium
          </DropDownItem>
          <DropDownItem
            onClick={(e) => {
              updateQueueItemPriority(e, item.id, "high");
            }}>
            High
          </DropDownItem>
        </DropDownContent>
      </DropDownContainer>
    );
  };

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
      {props.items
        .slice(
          props.page * props.rowsPerPage,
          props.page * props.rowsPerPage + props.rowsPerPage
        )
        .map((item, index) => {
          if (props.isMobile) {
            return (
              <TableRow tableFor={"sff"} isMobile={props.isMobile} key={index}>
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
                  <OptionsButton
                    props={{
                      itemId: item.id,
                      activeItemId,
                      setActiveItemId,
                      setDeleteModalActive: props.setDeleteModalActive,
                      view: props.view,
                      setSingleCheckedId: props.setSingleCheckedId,
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          } else {
            return (
              <TableRow tableFor={"sff"} key={index}>
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
                <TableCell className={"!pl-2"} minWidth={"15rem"}>
                  <ul className="flex m-0 flex-col list-none p-0">
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
                  <OptionsButton
                    props={{
                      itemId: item.id,
                      activeItemId,
                      setActiveItemId,
                      setDeleteModalActive: props.setDeleteModalActive,
                      view: props.view,
                      setSingleCheckedId: props.setSingleCheckedId,
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          }
        })}
    </TableBody>
  );
}
