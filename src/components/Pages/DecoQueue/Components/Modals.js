import React, { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsExclamationLg } from "react-icons/bs";
import { useQueueActions } from "../Functions/queue-actions";
import { twMerge } from "tailwind-merge";
import { IoIosCloseCircle } from "react-icons/io";

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

function DeleteModal({ props }) {
  return (
    <div className="bg-black/50 fixed flex w-screen h-screen items-center justify-center top-0 left-0 z-[99999]">
      <div className="bg-white p-4 rounded-md shadow-default flex gap-6 flex-col justify-between items-center">
        <BsExclamationLg className="h-16 p-2 rounded-full border border-solid border-red-600 bg-red-100 w-16 fill-red-600" />
        <h2>Are you sure you want to delete this item?</h2>
        <div className="w-full flex justify-center gap-4 item-center">
          <button
            className="bg-red-600 rounded-md text-white px-6 py-2 w-fit"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (props.checkedIds.length === 0) {
                props.deleteQueueItem(e, props.singleCheckedId);
                props.setSingleCheckedId(null);
              } else {
                props.deleteQueueItem(e, props.checkedIds);
                props.setCheckedIds([]);
              }
              props.setDeleteModalActive(false);
              props.setDeleteModalActive(false);
            }}>
            Delete
          </button>
          <button
            className="bg-gray-200 rounded-md text-black px-6 py-2 w-fit"
            onClick={() => props.setDeleteModalActive(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const MobileFilters = ({ props }) => {
  const { getQueueItems } = useQueueActions();
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState("");

  useEffect(() => {
    setSortBy(props.sort.sort_by);
    setOrder(props.sort.order);
  }, [props.sort]);

  return (
    <div
      className={twMerge(
        "bg-white transition duration-200 z-[99999] fixed top-0 right-0 h-full w-full overflow-y-auto",
        props.filtersActive ? "translate-x-0" : "-translate-x-full"
      )}>
      <button
        className="w-12 h-12 flex items-center justify-center absolute right-4 top-4"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          props.setFiltersActive(false);
          setOrder(props.sort.order);
          setSortBy(props.sort.sort_by);
        }}>
        <IoIosCloseCircle className="w-full h-full" />
      </button>
      <div className="p-4 mt-4">
        <p className="text-2xl font-medium">Sort Order</p>
        <ul className="mt-4 pl-2">
          <li className="py-2 flex">
            <input
              type="radio"
              id="asc"
              className="hidden"
              checked={order === "asc"}
              onChange={() => setOrder("asc")}
            />
            <label className="text-xl flex items-center gap-4" htmlFor="asc">
              <span className="rounded-full flex items-center justify-center h-6 w-6 bg-transparent border-secondary border border-solid">
                <span
                  className={twMerge(
                    "w-4 h-4 rounded-full",
                    order === "asc" ? "bg-secondary" : "bg-white"
                  )}
                />
              </span>
              Asc
            </label>
          </li>
          <li className="py-2 flex">
            <input
              type="radio"
              id="desc"
              className="hidden"
              checked={order === "desc"}
              onChange={() => setOrder("desc")}
            />
            <label className="text-xl flex items-center gap-4" htmlFor="desc">
              <span className="rounded-full flex items-center justify-center h-6 w-6 bg-transparent border-secondary border border-solid">
                <span
                  className={twMerge(
                    "w-4 h-4 rounded-full",
                    order === "desc" ? "bg-secondary" : "bg-white"
                  )}
                />
              </span>
              Desc
            </label>
          </li>
        </ul>
      </div>
      <div className="p-4 mt-4">
        <p className="text-2xl font-medium">Sort By</p>
        <ul className="mt-4 pl-2">
          <li className="py-2 flex">
            <input
              type="radio"
              id="order_number"
              className="hidden"
              checked={sortBy === "order_number"}
              onChange={() => setSortBy("order_number")}
            />
            <label
              className="text-xl flex items-center gap-4"
              htmlFor="order_number">
              <span className="rounded-full flex items-center justify-center h-6 w-6 bg-transparent border-secondary border border-solid">
                <span
                  className={twMerge(
                    "w-4 h-4 rounded-full",
                    sortBy === "order_number" ? "bg-secondary" : "bg-white"
                  )}
                />
              </span>
              Order Id
            </label>
          </li>
          <li className="py-2 flex">
            <input
              type="radio"
              id="description"
              className="hidden"
              checked={sortBy === "description"}
              onChange={() => setSortBy("description")}
            />
            <label
              className="text-xl flex items-center gap-4"
              htmlFor="description">
              <span className="rounded-full flex items-center justify-center h-6 w-6 bg-transparent border-secondary border border-solid">
                <span
                  className={twMerge(
                    "w-4 h-4 rounded-full",
                    sortBy === "description" ? "bg-secondary" : "bg-white"
                  )}
                />
              </span>
              Product Name
            </label>
          </li>
          <li className="py-2 flex">
            <input
              type="radio"
              id="sku"
              className="hidden"
              checked={sortBy === "sku"}
              onChange={() => setSortBy("sku")}
            />
            <label className="text-xl flex items-center gap-4" htmlFor="sku">
              <span className="rounded-full flex items-center justify-center h-6 w-6 bg-transparent border-secondary border border-solid">
                <span
                  className={twMerge(
                    "w-4 h-4 rounded-full",
                    sortBy === "sku" ? "bg-secondary" : "bg-white"
                  )}
                />
              </span>
              Sku
            </label>
          </li>
          <li className="py-2 flex">
            <input
              type="radio"
              id="qty"
              className="hidden"
              checked={sortBy === "qty"}
              onChange={() => setSortBy("qty")}
            />
            <label className="text-xl flex items-center gap-4" htmlFor="qty">
              <span className="rounded-full flex items-center justify-center h-6 w-6 bg-transparent border-secondary border border-solid">
                <span
                  className={twMerge(
                    "w-4 h-4 rounded-full",
                    sortBy === "qty" ? "bg-secondary" : "bg-white"
                  )}
                />
              </span>
              Quantity
            </label>
          </li>
          <li className="py-2 flex">
            <input
              type="radio"
              id="created_at"
              className="hidden"
              checked={sortBy === "created_at"}
              onChange={() => setSortBy("created_at")}
            />
            <label
              className="text-xl flex items-center gap-4"
              htmlFor="created_at">
              <span className="rounded-full flex items-center justify-center h-6 w-6 bg-transparent border-secondary border border-solid">
                <span
                  className={twMerge(
                    "w-4 h-4 rounded-full",
                    sortBy === "created_at" ? "bg-secondary" : "bg-white"
                  )}
                />
              </span>
              Created At
            </label>
          </li>
          <li className="py-2 flex">
            <input
              type="radio"
              id="priority"
              className="hidden"
              checked={sortBy === "priority"}
              onChange={() => setSortBy("priority")}
            />
            <label
              className="text-xl flex items-center gap-4"
              htmlFor="priority">
              <span className="rounded-full flex items-center justify-center h-6 w-6 bg-transparent border-secondary border border-solid">
                <span
                  className={twMerge(
                    "w-4 h-4 rounded-full",
                    sortBy === "priority" ? "bg-secondary" : "bg-white"
                  )}
                />
              </span>
              Priority
            </label>
          </li>
        </ul>
      </div>
      {props.sort.sort_by !== sortBy || props.sort.order !== order ? (
        <button
          className="absolute w-full py-4 z-[9999999] bg-gradient-to-r from-primary to-secondary text-white font-medium bottom-0 left-0 text-xl"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            props.setFiltersActive(false);
            getQueueItems(e, sortBy, order);
          }}>
          Apply
        </button>
      ) : null}
    </div>
  );
};

export { LoadingModal, Filters, DeleteModal, MobileFilters };
