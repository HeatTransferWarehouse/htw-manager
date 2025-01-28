import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { twMerge } from "tailwind-merge";

function ManuallyEnterOrder() {
  const dispatch = useDispatch();
  const [orderId, setOrderId] = useState("");
  const [validationError, setValidationError] = useState(false);
  const enterMissingOrder = () => {
    if (!orderId) {
      setValidationError(true);
    }
    dispatch({ type: "ENTER_MISSING_CLOTHING_QUEUE_ITEM", payload: orderId });
    setOrderId("");
  };
  useEffect(() => {
    if (orderId) {
      setValidationError(false);
    }
  }, [orderId]);
  return (
    <div className="flex relative gap-4">
      <label
        className={twMerge(
          validationError ? "text-red-600" : "text-black",
          "absolute -top-8"
        )}
        htmlFor="orderId">
        Missing Order Entry
      </label>
      <input
        className={twMerge(
          "m-0 p-2 border border-solid border-gray-300 focus:ring-2 rounded-md focus:outline-none placeholder:text-gray-400",
          validationError
            ? " focus:border-red-600 focus:ring-red-500/10 border-red-500 hover:border-red-600"
            : "focus:ring-secondary/10 focus:border-secondary  hover:border-secondary"
        )}
        type="tel"
        id="orderId"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        placeholder="Order ID"
      />
      <button
        onClick={enterMissingOrder}
        className="h-[42px] px-4 rounded text-sm bg-secondary text-white font-semibold">
        Add Order
      </button>
    </div>
  );
}

export default ManuallyEnterOrder;
