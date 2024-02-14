import { useDispatch } from "react-redux";
import { IoMdAlert } from "react-icons/io";
import React from "react";

export default function DeleteModal(props) {
  const dispatch = useDispatch();
  return (
    <>
      <div className="delete-user-modal">
        <div className="delete-user-modal-content">
          <IoMdAlert className="delete-user-modal-icon" />

          <h2>Are you sure you want to delete this user?</h2>
          <div className="delete-user-modal-buttons">
            <button
              onClick={(e) => {
                e.preventDefault();
                props.setDeleteModalActive(false);
                props.setSelectedUserId(null);
              }}
              className="delete-user-close">
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                props.setDeleteModalActive(false);
                dispatch({
                  type: "DELETE_USER",
                  payload: props.selectedUserId,
                });
                props.setSelectedUserId(null);
              }}
              className="delete-user-delete">
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
