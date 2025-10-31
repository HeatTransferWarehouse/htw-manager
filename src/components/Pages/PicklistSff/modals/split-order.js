import { Close } from '@material-ui/icons';
import React, { useState, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { FaCheck } from 'react-icons/fa6';
import { useDispatch } from 'react-redux';
import { twMerge } from 'tailwind-merge';
import {
  DropDownContainer,
  DropDownContent,
  DropDownItem,
  DropDownTrigger,
} from '../../../ui/dropdown';

function SplitOrderModal({
  activeOrder,
  setSplitOrderModalActive,
  setActiveOrders,
  view,
  page,
  rowsPerPage,
}) {
  const dispatch = useDispatch();
  const { itemsToSplit, toggleItem } = useSplitSelection(activeOrder?.line_items ?? []);
  const [shipments, setShipments] = useState([
    {
      id: 1,
      name: 'Shipment 1',
      items: activeOrder?.line_items.map((item) => item.id),
    },
  ]);

  const handleSplitItems = () => {
    console.log(shipments);
    dispatch({
      type: 'SPLIT_SFF_ORDER',
      payload: {
        orderId: activeOrder.order_id,
        shipments,
        view: view,
        page: page + 1,
        rowsPerPage: rowsPerPage,
      },
    });
    setActiveOrders([]);
  };

  return ReactDOM.createPortal(
    <div
      onClick={() => setSplitOrderModalActive(false)}
      className="bg-black/50 z-[2934857] w-screen h-screen fixed top-0 left-0 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white flex flex-col overflow-x-auto rounded max-h-[calc(100%-2rem)] max-w-[calc(100%-2rem)] min-w-[700px]"
      >
        <div className="bg-gray-200 p-2 flex items-center justify-between text-lg">
          <h2>
            Split Order: <strong>{activeOrder.order_id}</strong>
          </h2>
          <Close className="w-3 h-3" onClick={() => setSplitOrderModalActive(false)} />
        </div>
        <div className="p-2 overflow-y-auto">
          <p className="pb-2 text-lg">Order Items</p>
          <div className="flex bg-gray-100 border-gray-300 border rounded-md flex-col">
            <div className="bg-gray-200 flex items-center p-2 border-b border-gray-300">
              <div className="flex w-[300px] flex-col gap-1">
                <p className="text-medium ">Item</p>
              </div>
              <div className="flex w-[100px] flex-col gap-1">
                <p className="text-medium ">Tags</p>
              </div>
              <div className="flex w-[60px] flex-col gap-1">
                <p className="text-medium ">Qty</p>
              </div>
              <div className="flex w-[240px] flex-col gap-1">
                <p className="text-medium ">Shipment</p>
              </div>
            </div>
            {activeOrder?.line_items?.map((item, index) => (
              <div
                key={index}
                className="flex last:border-none border-b border-gray-300 items-start p-2"
              >
                <div className="flex w-[300px] text-sm flex-col gap-1">
                  <p>{item.name}</p>
                  <p className="text-gray-500">SKU: {item.sku}</p>
                </div>
                <div className="w-[100px] text-sm">
                  {item.is_dropship ? (
                    <span
                      title="Dropship Item"
                      className="bg-yellow-400 w-fit text-black text-xs rounded-md p-1"
                    >
                      {item.name.toLowerCase().includes('supacolor')
                        ? 'Supacolor Dropship'
                        : 'Dropship'}
                    </span>
                  ) : item.is_clothing ? (
                    <span
                      title="Dropship Item"
                      className="bg-blue-700 w-fit text-white text-xs rounded-md p-1"
                    >
                      Clothing
                    </span>
                  ) : (
                    ''
                  )}
                </div>
                <div className="w-[60px] text-sm">{item.quantity}</div>
                <div className="w-[240px] text-sm">
                  <ShipmentDropdown shipments={shipments} setShipments={setShipments} item={item} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-300 p-2 flex justify-end gap-2">
          <button
            className="px-4 py-1 rounded hover:bg-gray-200"
            onClick={() => setSplitOrderModalActive(false)}
          >
            Cancel
          </button>
          <button
            disabled={shipments.length < 2}
            className={twMerge(
              'px-4 py-1 rounded',
              shipments.length > 1
                ? 'bg-secondary hover:bg-secondary/90 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
            onClick={() => {
              if (shipments.length < 2) return;
              handleSplitItems();
              setSplitOrderModalActive(false);
            }}
          >
            Split
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ShipmentDropdown({ shipments, setShipments, item }) {
  return (
    <DropDownContainer className={'top-0 w-full'} type="click">
      <DropDownTrigger className="top-0 w-full bg-white border justify-between border-gray-400">
        {shipments.find((s) => s.items.includes(item.id))?.name || 'Select Shipment'}
      </DropDownTrigger>
      <DropDownContent>
        {shipments.map((shipment) => (
          <DropDownItem
            key={shipment.id}
            className={twMerge(
              'p-2  text-sm cursor-pointer flex items-center justify-between',
              shipment.items.includes(item.id) && 'bg-secondary/10'
            )}
            onClick={() => {
              // Assign item to this shipment
              const updatedShipments = shipments.map((s) => {
                if (s.id === shipment.id) {
                  return { ...s, items: [...s.items, item.id] };
                } else if (s.items.includes(item.id)) {
                  return { ...s, items: s.items.filter((i) => i !== item.id) };
                }
                return s;
              });
              setShipments(updatedShipments);
            }}
          >
            <span>{shipment.name}</span>
            {shipment.items.includes(item.id) && <FaCheck className="text-secondary" />}
          </DropDownItem>
        ))}
        <DropDownItem
          className="p-2  text-sm cursor-pointer flex items-center justify-between"
          onClick={() => {
            const newShipmentId = shipments.length + 1;
            const newShipment = {
              id: newShipmentId,
              name: `Shipment ${newShipmentId}`,
              items: [item.id],
            };
            const updatedShipments = shipments.map((s) => ({
              ...s,
              items: s.items.filter((i) => i !== item.id),
            }));
            setShipments([...updatedShipments, newShipment]);
          }}
        >
          <span>Shipment {shipments.length + 1} (creates new)</span>
        </DropDownItem>
      </DropDownContent>
    </DropDownContainer>
  );
}

function useSplitSelection(lineItems = []) {
  const [itemsToSplit, setItemsToSplit] = useState([]);

  const totalItems = lineItems.length;

  // Derived flag: can split only if some are selected but not all
  const canSplit = useMemo(() => {
    const selected = itemsToSplit.length;
    return selected > 0 && selected < totalItems;
  }, [itemsToSplit, totalItems]);

  // Toggle selection of an item
  const toggleItem = useCallback((id) => {
    setItemsToSplit((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }, []);

  // Reset selections (if needed)
  const reset = useCallback(() => setItemsToSplit([]), []);

  return {
    itemsToSplit,
    canSplit,
    toggleItem,
    reset,
  };
}

export default SplitOrderModal;
