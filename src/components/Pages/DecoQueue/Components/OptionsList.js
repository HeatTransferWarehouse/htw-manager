import React from "react";
import { useQueueActions } from "../Functions/queue-actions";

export function OptionsList({ props }) {
  const {
    startQueueItem,
    completeQueueItem,
    sendBackCompletedQueueItem,
    sendBackProgressQueueItem,
  } = useQueueActions();
  return (
    <ul className="list-none m-0 p-0">
      {props.view === "new" ? (
        <>
          <li
            className="cursor-pointer hover:bg-green-600/10 py-2 px-3 hover:text-green-600"
            onClick={(e) => startQueueItem(e, props.id)}>
            Start
          </li>
          <li
            className="cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary"
            onClick={(e) => {
              completeQueueItem(e, props.id);
            }}>
            Complete
          </li>
          <li
            className="cursor-pointer hover:bg-red-600/10 py-2 px-3 hover:text-red-600"
            onClick={() => props.setDeleteModalActive(true)}>
            Delete
          </li>
        </>
      ) : props.view === "progress" ? (
        <>
          <li
            className="cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary"
            onClick={(e) => {
              completeQueueItem(e, props.id);
            }}>
            Complete
          </li>
          <li
            className="cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary"
            onClick={(e) => sendBackProgressQueueItem(e, props.id)}>
            Send back
          </li>
          <li
            className="cursor-pointer hover:bg-red-600/10 py-2 px-3 hover:text-red-600"
            onClick={() => props.setDeleteModalActive(true)}>
            Delete
          </li>
        </>
      ) : (
        <>
          <li
            className="cursor-pointer hover:bg-secondary/10 py-2 px-3 hover:text-secondary"
            onClick={(e) => sendBackCompletedQueueItem(e, props.id)}>
            Send back
          </li>
          <li
            className="cursor-pointer hover:bg-red-600/10 py-2 px-3 hover:text-red-600"
            onClick={() => props.setDeleteModalActive(true)}>
            Delete
          </li>
        </>
      )}
    </ul>
  );
}
