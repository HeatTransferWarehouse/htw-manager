import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

function LoadingModal() {
  return (
    <div className="modal-bg">
      <AiOutlineLoading3Quarters className="loading-icon" />
    </div>
  );
}

export { LoadingModal };
