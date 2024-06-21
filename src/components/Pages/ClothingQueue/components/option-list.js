import React from "react";
import { useQueueActions } from "../functions/actions";

export function OptionsList({ props }) {
  const { updateQueueOrderedStatus } = useQueueActions();
  return (
    <ul>
      {props.view === "new" ? (
        <>
          <li
            className="cursor-pointer whitespace-nowrap hover:bg-green-600/10 py-2 px-3 hover:text-green-600"
            onClick={() => updateQueueOrderedStatus(props.id, true)}>
            Mark Ordered
          </li>
          <li
            className="cursor-pointer whitespace-nowrap hover:bg-red-600/10 py-2 px-3 hover:text-red-600"
            onClick={() => props.setDeleteModalActive(true)}>
            Delete
          </li>
        </>
      ) : (
        <>
          <li
            className="cursor-pointer whitespace-nowrap hover:bg-secondary/10 py-2 px-3 hover:text-secondary"
            onClick={() => updateQueueOrderedStatus(props.id, false)}>
            Un-Marl Ordered
          </li>
          <li
            className="cursor-pointer whitespace-nowrap hover:bg-red-600/10 py-2 px-3 hover:text-red-600"
            onClick={() => props.setDeleteModalActive(true)}>
            Delete
          </li>
        </>
      )}
    </ul>
  );
}
