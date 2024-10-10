import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TableComponent } from "./components/table";
import { useLocation } from "react-router-dom";
import AdvancedSearchModal from "./components/advanced-search-modal";
import DeleteModal from "../../modals/deleteModal";

export default function ClothingQueue() {
  const location = useLocation();
  const dispatch = useDispatch();

  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view") || "new"; // Default to 'new' if no parameter is
  const items = useSelector((store) => store.clothingReducer.items);
  const sort = useSelector((store) => store.clothingReducer.sort);
  //   const error = useSelector((store) => store.clothingReducer.error);
  const loading = useSelector((store) => store.clothingReducer.loading);

  const [newItems, setNewItems] = useState([]);
  const [orderedItems, setOrderedItems] = useState([]);

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

    items.forEach((item) => {
      if (item.is_ordered) {
        newOrderedItems.push(item);
      } else {
        newNewItems.push(item);
      }
    });

    setOrderedItems(newOrderedItems);
    setNewItems(newNewItems);
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
    </>
  );
}
