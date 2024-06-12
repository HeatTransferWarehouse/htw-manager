import React from "react";
import { useQueueActions } from "../Functions/queue-actions";

export function OptionsList({ props }) {
  const {
    startQueueItem,
    completeQueueItem,
    deleteQueueItem,
    sendBackCompletedQueueItem,
    sendBackProgressQueueItem,
  } = useQueueActions();
  return (
    <div className="options-list">
      <ul>
        {props.view === "new" ? (
          <>
            <li
              className="list-start"
              onClick={(e) => startQueueItem(e, props.id)}>
              Start
            </li>
            <li
              onClick={(e) => {
                completeQueueItem(e, props.id);
              }}>
              Complete
            </li>
            <li
              className="list-delete"
              onClick={(e) => deleteQueueItem(e, props.id)}>
              Delete
            </li>
          </>
        ) : props.view === "progress" ? (
          <>
            <li
              className="list-start"
              onClick={(e) => {
                completeQueueItem(e, props.id);
              }}>
              Complete
            </li>
            <li onClick={(e) => sendBackProgressQueueItem(e, props.id)}>
              Send back
            </li>
            <li
              className="list-delete"
              onClick={(e) => deleteQueueItem(e, props.id)}>
              Delete
            </li>
          </>
        ) : (
          <>
            <li onClick={(e) => sendBackCompletedQueueItem(e, props.id)}>
              Send back
            </li>
            <li
              className="list-delete"
              onClick={(e) => deleteQueueItem(e, props.id)}>
              Delete
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
