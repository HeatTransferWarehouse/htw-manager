import React, { useState, useEffect, useRef } from "react";
import { FaCheck } from "react-icons/fa";
import { useQueueActions } from "../Functions/queue-actions";
import OptionsButton from "./OptionsList";
import { TableBody, TableCell, TableRow } from "../../../Table/Table";
import {
  DropDownContainer,
  DropDownTrigger,
  DropDownContent,
  DropDownItem,
} from "../../../ui/dropdown";

export function TableContent({ props }) {
  const { updateQueueItemPriority, getColor } = useQueueActions();
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
          const color = getColor(item);

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
                    <p className="py-2">{item.order_number}</p>
                    <p className="py-2 font-medium">{item.description}</p>
                    <p className="py-2">
                      <span
                        className="rounded-md !p-2"
                        style={{
                          backgroundColor: color,
                        }}>
                        {item.sku}
                      </span>
                    </p>
                    <p className="py-2 absolute top-2 right-4">x{item.qty}</p>
                    <p className="flex items-center">
                      <span className="font-medium">Priority</span>:{" "}
                      {renderPriorityButton(item)}
                    </p>
                    <p className="py-2 absolute bottom-2 right-4">
                      {item.created_at.split(": ")[1].split(" T")[0]}
                    </p>
                  </div>
                </TableCell>
                <TableCell
                  isMobile={index === 0 && props.isMobile}
                  className="p-0">
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
                <TableCell minWidth="7rem">{item.order_number}</TableCell>
                <TableCell className="p-2" minWidth="10rem">
                  <span
                    className="rounded-md !p-2"
                    style={{
                      backgroundColor: color,
                    }}>
                    {item.sku}
                  </span>
                </TableCell>
                <TableCell minWidth="15rem">{item.description}</TableCell>
                <TableCell>{item.qty}</TableCell>
                <TableCell className="p-2" minWidth="5rem">
                  {renderPriorityButton(item)}
                </TableCell>
                <TableCell minWidth="8rem">
                  {item.created_at.split(": ")[1].split(" T")[0]}
                </TableCell>
                <TableCell className="p-0">
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
