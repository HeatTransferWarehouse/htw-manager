import React, { useEffect, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsExclamationLg } from "react-icons/bs";
import { useQueueActions } from "../Functions/queue-actions";
import { twMerge } from "tailwind-merge";
import { useDrag } from "@use-gesture/react";
import {
  ModalOverlay,
  Modal,
  ModalCloseMobile,
  ModalCloseDesktop,
  ModalContent,
} from "../../../Modal/modal";

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
  const modalRef = useRef(null);

  useEffect(() => {
    setSortBy(props.sort.sort_by);
    setOrder(props.sort.order);
  }, [props.sort]);

  const bind = useDrag(({ down, movement: [, my], cancel }) => {
    if (my > 100) cancel(props.setFiltersActive(false));
    if (!down && my > 50) props.setFiltersActive(false);
  });

  return (
    <ModalOverlay open={props.filtersActive}>
      <Modal open={props.filtersActive}>
        <ModalCloseMobile ref={modalRef} bind={bind} />
        <ModalContent>
          <div className="p-4">
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
                <label
                  className="text-xl flex items-center gap-4"
                  htmlFor="asc">
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
                <label
                  className="text-xl flex items-center gap-4"
                  htmlFor="desc">
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
                <label
                  className="text-xl flex items-center gap-4"
                  htmlFor="sku">
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
                <label
                  className="text-xl flex items-center gap-4"
                  htmlFor="qty">
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
              className="w-full py-4 z-[9999999] bg-secondary text-white font-medium bottom-0 left-0 text-xl"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                props.setFiltersActive(false);
                getQueueItems(e, sortBy, order);
              }}>
              Apply
            </button>
          ) : null}
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );
};

function AdvancedSearchModal({ props }) {
  const closeRef = useRef(null);
  const bgRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (bgRef.current === e.target) {
      props.setShowAdvancedSearchModal(false);
    }
  };

  const bind = useDrag(({ down, movement: [, my], cancel }) => {
    if (my > 100) cancel(props.setShowAdvancedSearchModal(false));
    if (!down && my > 50) props.setShowAdvancedSearchModal(false);
  });
  return (
    <ModalOverlay
      ref={bgRef}
      handleClick={handleOutsideClick}
      open={props.open}>
      <Modal open={props.open}>
        <ModalCloseMobile ref={closeRef} bind={bind} />
        <ModalCloseDesktop
          handleClick={() => props.setShowAdvancedSearchModal(false)}
        />
        <ModalContent>
          <p className="text-center font-bold mb-4 text-2xl">
            Advanced Search Query
          </p>
          <div className="my-2">
            <p>
              You are able to make advanced searches for specific columns in the
              table by using this syntax:
            </p>
            <p className="my-2 font-medium">
              {"{"}column_name{"}"}:{"{"}column_value{"}"}
            </p>
            <p>
              You are also able to chain these together by include an{" "}
              <strong>"&"</strong> between them:
            </p>
            <p className="my-2 font-medium">
              {"{"}column{"}"}:{"{"}value{"}"}&{"{"}column_2{"}"}:{"{"}value_2
              {"}"}
            </p>
            <p className="my-2">
              <strong>Note</strong>: these queries are not case sensitive.
            </p>
          </div>
          <div className="my-8">
            <p className="mb-4 font-bold">Available Columns:</p>
            <ul className="flex flex-col gap-2">
              <li>qty</li>
              <li>date (mm/dd/yyyy format)</li>
              <li>sku</li>
              <li>name (product name)</li>
              <li>id (order number)</li>
            </ul>
          </div>
          <div className="my-8">
            <p className="mb-4 font-bold">Example Queries:</p>
            <ul className="flex flex-col gap-2">
              <li>
                Single Query:{" "}
                <span className="font-medium">sku:STOCK-1041</span>
              </li>
              <li>
                Date Query: <span className="font-medium">date:6/24/24</span>
              </li>
              <li>
                Multiple Queries:{" "}
                <span className="font-medium">sku:SDC587&qty:2</span>
              </li>
              <li>
                Multiple Queries for same column:{" "}
                <span className="font-medium">sku:SDC587&sku:STOCK-1041</span>
              </li>
            </ul>
          </div>
          <p className="mt-4">
            <span className="font-bold">Note:</span> Advanced searches are for{" "}
            <strong>EXACT MATCHES</strong>. If you want to filter as you type,
            use a basic search query by simply typing in the value you would
            like to search for.
          </p>
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );
}

export {
  LoadingModal,
  Filters,
  DeleteModal,
  MobileFilters,
  AdvancedSearchModal,
};
