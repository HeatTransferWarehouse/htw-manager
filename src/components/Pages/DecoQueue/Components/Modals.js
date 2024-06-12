import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

function LoadingModal() {
  return (
    <div className="modal-bg">
      <AiOutlineLoading3Quarters className="loading-icon" />
    </div>
  );
}

const Filters = ({ props }) => {
  return (
    <div className={`filters-modal ${props.showFilters && "open"}`}>
      <button
        className="close-filters"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          props.setShowFilters(false);
        }}>
        Close
      </button>
    </div>
  );
};

export { LoadingModal, Filters };
