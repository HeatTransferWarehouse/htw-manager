import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TableComponent } from "./components/table";
import { useLocation } from "react-router-dom";
import AdvancedSearchModal from "./components/advanced-search-modal";
import DeleteModal from "../../modals/deleteModal";
import { CgSpinnerAlt } from "react-icons/cg";
import Toast from "../../ui/toast";

export default function ClothingQueue() {
  const location = useLocation();
  const dispatch = useDispatch();

  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view") || "new"; // Default to 'new' if no parameter is
  const items = useSelector((store) => store.clothingReducer.items);
  const sort = useSelector((store) => store.clothingReducer.sort);
  const loading = useSelector((store) => store.clothingReducer.loading);
  const response = useSelector((store) => store.clothingReducer.response);
  const [newItems, setNewItems] = useState([]);
  const [orderedItems, setOrderedItems] = useState([]);
  const [onHoldItems, setOnHoldItems] = useState([]);

  const [isMobile, setIsMobile] = useState(false);
  const [showAdvancedSearchModal, setShowAdvancedSearchModal] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [checkedIds, setCheckedIds] = useState([]);
  const [singleCheckedId, setSingleCheckedId] = useState(null);
  const [deleteModalActive, setDeleteModalActive] = useState(false);

  useEffect(() => {
    dispatch({ type: "GET_CLOTHING_QUEUE_ITEMS" });
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const newNewItems = [];
    const newOrderedItems = [];
    const newOnHoldItems = [];

    items.forEach((item) => {
      if (item.is_ordered) {
        newOrderedItems.push(item);
      } else if (item.on_hold) {
        newOnHoldItems.push(item);
      } else {
        newNewItems.push(item);
      }
    });

    setOrderedItems(newOrderedItems);
    setNewItems(newNewItems);
    setOnHoldItems(newOnHoldItems);
    !loading && setItemsLoading(false);
  }, [items, loading]);

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (checkedIds.length === 0) {
      dispatch({
        type: "DELETE_CLOTHING_QUEUE_ITEM",
        payload: singleCheckedId,
      });
      setSingleCheckedId(null);
    } else {
      dispatch({ type: "DELETE_CLOTHING_QUEUE_ITEM", payload: checkedIds });
      setCheckedIds([]);
    }
    setDeleteModalActive(false);
  };

  return (
    <>
      <h1 className="font-bold mx-auto mb-4 mt-8 text-4xl">Clothing Queue</h1>
      <TableComponent
        props={{
          checkedIds,
          items: {
            orderedItems,
            newItems,
            onHoldItems,
          },
          itemsLoading,
          isMobile,
          setCheckedIds,
          view,
          sort,
          setSingleCheckedId,
          singleCheckedId,
          setShowAdvancedSearchModal,
          setDeleteModalActive,
        }}
      />
      <div>
        <AdvancedSearchModal
          props={{ setShowAdvancedSearchModal, open: showAdvancedSearchModal }}
        />
        <DeleteModal
          props={{
            open: deleteModalActive,
            setOpen: setDeleteModalActive,
            deleteFunction: handleDelete,
          }}
        />
      </div>
      {loading && (
        <div className="w-screen h-screen bg-black/50 fixed top-0 left-0 flex items-center justify-center z-50">
          <CgSpinnerAlt className="animate-spin text-white w-12 h-12" />
        </div>
      )}
      <Toast
        onClose={() => dispatch({ type: "CLEAR_CLOTHING_QUEUE_RESPONSE" })}
        isOpen={response.message !== null}
        title={response.message}
        variant={
          response.status >= 200 && response.status < 204
            ? "success"
            : response.status >= 400 && response.status <= 500
            ? "error"
            : "default"
        }
      />
    </>
  );
}
