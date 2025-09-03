import React from 'react';
import Search from './search';
import { twMerge } from 'tailwind-merge';
import { FaSyncAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { toTitleCase } from '../utils/utils';
import { createPortal } from 'react-dom';
import {
  Pagination,
  PaginationControls,
  PaginationOption,
  PaginationSheet,
  PaginationTrigger,
} from '../../../ui/pagination';
import {
  DropDownContainer,
  DropDownContent,
  DropDownItem,
  DropDownTrigger,
} from '../../../ui/dropdown';
import TagsDropdown from './tags';
import { Link, useLocation } from 'react-router-dom';
import { TbTriangleFilled } from 'react-icons/tb';
import SplitOrderModal from '../modals/split-order';

function PicklistHeader({
  handleSearch,
  view,
  setActiveOrders,
  printOrders,
  activeOrders,
  syncing,
  setDeleteModalActive,
  rowsPerPage,
  setRowsPerPage,
  page,
  setPage,
  orderTagsList,
  orderCount,
  setType,
}) {
  const location = useLocation();
  const pathname = location.pathname;
  const [orderSplitModalActive, setOrderSplitModalActive] = React.useState(false);

  const dispatch = useDispatch();
  const oneOrderActive = activeOrders.length === 1;
  const multipleItemsInOrder = oneOrderActive && (activeOrders[0]?.line_items?.length ?? 0) > 1;
  const canSplitOrder = oneOrderActive && multipleItemsInOrder;
  const canMergeOrders =
    activeOrders.length > 1 && activeOrders.every((o) => o.order_id === activeOrders[0].order_id);

  return (
    <>
      <div className="p-4 flex  items-center gap-3">
        <Search onSearch={handleSearch} />
        <ViewDropdown view={view} url={pathname} />
        <PrintDropdown printOrders={printOrders} setType={setType} activeOrders={activeOrders} />
        <ActionsDropdown
          canSplitOrder={canSplitOrder}
          oneOrderActive={oneOrderActive}
          activeOrders={activeOrders}
          setOrderSplitModalActive={setOrderSplitModalActive}
          canMergeOrders={canMergeOrders}
          dispatch={dispatch}
          view={view}
          page={page}
          rowsPerPage={rowsPerPage}
          setActiveOrders={setActiveOrders}
          setDeleteModalActive={setDeleteModalActive}
        />
        {/* <TagsDropdown orderTagsList={orderTagsList} /> */}
        <button
          disabled={syncing}
          onClick={() => {
            dispatch({ type: 'SYNC_ORDERS' });
          }}
          className={twMerge(
            'px-4 py-2 flex items-center gap-2 overflow-hidden relative text-lg rounded-md border text-black border-black hover:text-secondary hover:border-secondary',
            syncing ? 'cursor-not-allowed pointer-events-none border-gray-500 text-gray-500' : ''
          )}
        >
          <span className="z-50 flex items-center gap-2">
            Sync Orders <FaSyncAlt className={twMerge('w-3 h-3', syncing && 'animate-spin')} />
          </span>
        </button>

        <Pagination
          props={{
            itemsCount: orderCount,
            rowsPerPage: rowsPerPage,
            setRowsPerPage: setRowsPerPage,
            page: page,
            setPage: setPage,
          }}
        >
          <PaginationTrigger />
          <PaginationControls />
          <PaginationSheet sheetPosition={'top'}>
            <PaginationOption value={25}>25</PaginationOption>
            <PaginationOption value={50}>50</PaginationOption>
            <PaginationOption value={100}>100</PaginationOption>
            <PaginationOption value={250}>250</PaginationOption>
          </PaginationSheet>
        </Pagination>
      </div>
      {orderSplitModalActive && (
        <SplitOrderModal
          activeOrder={activeOrders[0]}
          setSplitOrderModalActive={setOrderSplitModalActive}
          setActiveOrders={setActiveOrders}
          view={view}
          page={page}
          rowsPerPage={rowsPerPage}
        />
      )}
    </>
  );
}

const ViewDropdown = ({ view, url }) => {
  return (
    <DropDownContainer type="click">
      <DropDownTrigger className="w-full hover:border-secondary border text-lg border-black justify-between">
        View: {toTitleCase(view)}
      </DropDownTrigger>
      <DropDownContent className={'max-h-fit'}>
        <DropDownItem
          className={twMerge(
            'text-black text-base p-0',
            view === 'all' && 'bg-secondary/10 text-secondary'
          )}
        >
          <Link className="w-full flex p-2 border-b border-b-gray-300" to={`${url}?view=all`}>
            All
          </Link>
        </DropDownItem>
        <DropDownItem
          className={twMerge(
            'text-black text-base p-0',
            view === 'printed' && 'bg-secondary/10 text-secondary'
          )}
        >
          <Link className="w-full flex p-2 border-b border-b-gray-300" to={`${url}?view=printed`}>
            Printed
          </Link>
        </DropDownItem>
        <DropDownItem
          className={twMerge(
            'text-black text-base p-0',
            view === 'not-printed' && 'bg-secondary/10 text-secondary'
          )}
        >
          <Link
            className="w-full flex p-2 border-b border-b-gray-300"
            to={`${url}?view=not-printed`}
          >
            Not Printed
          </Link>
        </DropDownItem>
        <DropDownItem
          className={twMerge(
            'text-black text-base p-0',
            view === 'drop-ship' && 'bg-secondary/10 text-secondary'
          )}
        >
          <Link className="w-full flex p-2 border-b border-b-gray-300" to={`${url}?view=dropship`}>
            Dropship
          </Link>
        </DropDownItem>
        <DropDownItem
          className={twMerge(
            'text-black text-base p-0',
            view === 'split' && 'bg-secondary/10 text-secondary'
          )}
        >
          <Link className="w-full flex p-2" to={`${url}?view=split`}>
            Split Orders
          </Link>
        </DropDownItem>
      </DropDownContent>
    </DropDownContainer>
  );
};
const PrintDropdown = ({ printOrders, activeOrders, setType }) => {
  return (
    <DropDownContainer type="click">
      <DropDownTrigger className="w-full hover:border-secondary border text-lg border-black justify-between">
        Print
      </DropDownTrigger>
      <DropDownContent>
        <DropDownItem
          className="border-b border-gray-300"
          disabled={activeOrders.length === 0}
          onClick={() => {
            setType('picklist');
            printOrders('picklist');
          }}
        >
          Picklist
        </DropDownItem>
        <DropDownItem
          disabled={activeOrders.length === 0}
          onClick={() => {
            setType('conversion');
            printOrders('conversion');
          }}
        >
          Conversion List
        </DropDownItem>
      </DropDownContent>
    </DropDownContainer>
  );
};
const ActionsDropdown = ({
  canSplitOrder,
  oneOrderActive,
  activeOrders,
  setOrderSplitModalActive,
  canMergeOrders,
  dispatch,
  setActiveOrders,
  view,
  page,
  rowsPerPage,
  setDeleteModalActive,
}) => {
  const splitButtonRef = React.useRef(null);
  const mergeButtonRef = React.useRef(null);

  const [tooltip, setTooltip] = React.useState(null);

  const showTooltip = (ref, text) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setTooltip({
      text,
      // vertical center of button
      top: rect.top + rect.height / 2,
      // right edge of button, plus small gap
      left: rect.left + rect.width + 8,
    });
  };

  const hideTooltip = () => setTooltip(null);

  return (
    <>
      <DropDownContainer type="click">
        <DropDownTrigger className="w-full hover:border-secondary border text-lg border-black justify-between">
          Actions
        </DropDownTrigger>
        <DropDownContent className="overflow-visible">
          {/* Split Orders */}
          <DropDownItem
            ref={splitButtonRef}
            disabled={!canSplitOrder}
            className={twMerge('text-base relative border-b border-gray-300 p-2')}
            onClick={() => {
              if (canSplitOrder) setOrderSplitModalActive(true);
            }}
            onMouseEnter={() => {
              if (!canSplitOrder) {
                showTooltip(
                  splitButtonRef,
                  activeOrders.length === 0
                    ? 'Splitting is disabled when no orders are selected'
                    : oneOrderActive
                      ? 'Splitting is only available for orders with multiple items'
                      : 'Splitting is only available when one order is selected'
                );
              }
            }}
            onMouseLeave={hideTooltip}
          >
            Split Order
          </DropDownItem>

          {/* Combine Orders */}
          <DropDownItem
            ref={mergeButtonRef}
            disabled={!canMergeOrders}
            className={twMerge(
              'text-base relative text-nowrap border-b border-gray-300 p-2',
              canMergeOrders
                ? 'text-black hover:bg-secondary/10 cursor-pointer'
                : 'text-gray-500 !bg-transparent hover:text-gray-500 cursor-not-allowed'
            )}
            onClick={() => {
              if (canMergeOrders) {
                dispatch({
                  type: 'COMBINE_ORDERS',
                  payload: {
                    orderId: activeOrders[0].order_id,
                    shipments: activeOrders.map((order) => Number(order.shipment_number)),
                    view,
                    page: page + 1,
                    rowsPerPage,
                  },
                });
                setActiveOrders([]);
              }
            }}
            onMouseEnter={() => {
              if (!canMergeOrders) {
                showTooltip(
                  mergeButtonRef,
                  activeOrders.length === 0
                    ? 'Combining is disabled when no orders are selected'
                    : 'Combining is only available for orders that were split'
                );
              }
            }}
            onMouseLeave={hideTooltip}
          >
            Combine Orders
          </DropDownItem>
          <DropDownItem
            onClick={() => setDeleteModalActive(true)}
            className="text-red-500 hover:bg-red-500/5 hover:text-red-500"
            disabled={activeOrders.length === 0}
          >
            Delete ({activeOrders.length})
          </DropDownItem>
        </DropDownContent>
      </DropDownContainer>

      {/* Tooltip (portal-like) */}
      {tooltip &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: tooltip.top,
              left: tooltip.left + 2,
              transform: 'translateY(-50%)',
              zIndex: 9999,
            }}
            className="bg-gray-800 text-white text-sm px-3 py-2 rounded shadow-default whitespace-nowrap"
          >
            <TbTriangleFilled
              className="absolute -rotate-90 left-[-6px] top-1/2 -translate-y-1/2 text-gray-800"
              size={12}
            />
            {tooltip.text}
          </div>,
          document.body
        )}
    </>
  );
};

export default PicklistHeader;
