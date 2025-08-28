import React from 'react';
import Search from './search';
import { twMerge } from 'tailwind-merge';
import { FaSyncAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { toTitleCase } from '../utils/utils';
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
        <button
          disabled={activeOrders.length === 0}
          className={twMerge(
            ' px-4 py-2 text-lg rounded-md border',
            activeOrders.length > 0
              ? ' text-secondary border-secondary hover:bg-secondary hover:text-white'
              : ' text-gray-500 border-gray-500 cursor-not-allowed'
          )}
          onClick={printOrders}
        >
          Print
        </button>
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
        />
        {/* <TagsDropdown orderTagsList={orderTagsList} /> */}
        <button
          onClick={() => {
            dispatch({ type: 'SYNC_ORDERS' });
          }}
          className="px-4 py-2 flex items-center gap-2 text-lg rounded-md border text-black border-black hover:text-secondary hover:border-secondary"
        >
          Sync Orders <FaSyncAlt className={twMerge('w-3 h-3', syncing && 'animate-spin')} />
        </button>
        <button
          disabled={activeOrders.length === 0}
          className={twMerge(
            ' px-4 py-2 text-lg rounded-md border',
            activeOrders.length > 0
              ? ' text-red-600 border-red-600 hover:bg-red-600 hover:text-white'
              : ' text-gray-500 border-gray-500 cursor-not-allowed'
          )}
          onClick={() => setDeleteModalActive(true)}
        >
          Delete ({activeOrders.length})
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
      <DropDownContent>
        <DropDownItem
          className={twMerge(
            'text-black text-base p-0',
            view === 'all' && 'bg-secondary/10 text-secondary'
          )}
        >
          <Link className="w-full flex p-2" to={`${url}?view=all`}>
            All
          </Link>
        </DropDownItem>
        <DropDownItem
          className={twMerge(
            'text-black text-base p-0',
            view === 'printed' && 'bg-secondary/10 text-secondary'
          )}
        >
          <Link className="w-full flex p-2" to={`${url}?view=printed`}>
            Printed
          </Link>
        </DropDownItem>
        <DropDownItem
          className={twMerge(
            'text-black text-base p-0',
            view === 'not-printed' && 'bg-secondary/10 text-secondary'
          )}
        >
          <Link className="w-full flex p-2" to={`${url}?view=not-printed`}>
            Not Printed
          </Link>
        </DropDownItem>
        <DropDownItem
          className={twMerge(
            'text-black text-base p-0',
            view === 'drop-ship' && 'bg-secondary/10 text-secondary'
          )}
        >
          <Link className="w-full flex p-2" to={`${url}?view=dropship`}>
            Dropship
          </Link>
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
}) => {
  const splitButtonRef = React.useRef(null);
  const mergeButtonRef = React.useRef(null);
  const [splitToolTipPositions, setSplitToolTipPositions] = React.useState({ top: 0, left: 0 });
  const [mergeToolTipPositions, setMergeToolTipPositions] = React.useState({ top: 0, left: 0 });
  const [triggerClicked, setTriggerClicked] = React.useState(false);

  React.useEffect(() => {
    if (splitButtonRef.current) {
      setSplitToolTipPositions({
        top:
          splitButtonRef.current.getBoundingClientRect().top -
          splitButtonRef.current.getBoundingClientRect().height * 3 +
          10,
        left:
          splitButtonRef.current.getBoundingClientRect().left +
          splitButtonRef.current.getBoundingClientRect().width,
      });
    }
    if (mergeButtonRef.current) {
      setMergeToolTipPositions({
        top:
          mergeButtonRef.current.getBoundingClientRect().top -
          mergeButtonRef.current.getBoundingClientRect().height * 3 +
          10,
        left:
          mergeButtonRef.current.getBoundingClientRect().left +
          mergeButtonRef.current.getBoundingClientRect().width,
      });
    }
  }, [triggerClicked]);

  return (
    <DropDownContainer type="click">
      <DropDownTrigger
        onClick={() => setTriggerClicked(true)}
        className="w-full hover:border-secondary border text-lg border-black justify-between"
      >
        Actions
      </DropDownTrigger>
      <DropDownContent className="overflow-visible">
        <DropDownItem
          ref={splitButtonRef}
          className={twMerge(
            'text-base relative border-b group/split border-gray-300 p-2',
            canSplitOrder
              ? 'text-black hover:bg-secondary/10'
              : 'text-gray-500 !bg-transparent hover:text-gray-500 cursor-not-allowed'
          )}
        >
          <button
            onClick={(e) => {
              if (canSplitOrder) {
                setOrderSplitModalActive(true);
              }
            }}
          >
            Split Order
          </button>
          {!canSplitOrder && (
            <span
              style={{ left: splitToolTipPositions.left, top: splitToolTipPositions.top }}
              className="fixed top-0 opacity-0 group-hover/split:opacity-100 pointer-events-none transition-opacity text-sm text-nowrap p-2 bg-gray-800 shadow-default rounded text-white"
            >
              <TbTriangleFilled className="absolute top-1/2 -translate-y-1/2 -left-2 -rotate-90 text-gray-800" />
              {activeOrders.length === 0
                ? 'Splitting is disabled when no orders are selected'
                : oneOrderActive
                  ? 'Splitting is only available for orders with multiple items'
                  : 'Splitting is only available when one order is selected'}
            </span>
          )}
        </DropDownItem>

        <DropDownItem
          ref={mergeButtonRef}
          disabled={!canMergeOrders}
          className={twMerge(
            'text-base relative text-nowrap group/combine p-2',
            canMergeOrders
              ? 'text-black hover:bg-secondary/10'
              : 'text-gray-500 !bg-transparent hover:text-gray-500 cursor-not-allowed'
          )}
          onClick={(e) => {
            if (canMergeOrders) {
              // Dispatch merge action
              dispatch({
                type: 'COMBINE_ORDERS',
                payload: {
                  orderId: activeOrders[0].order_id,
                  shipments: activeOrders.map((order) => Number(order.shipment_number)),
                  view: view,
                  page: page + 1,
                  rowsPerPage: rowsPerPage,
                },
              });
              // Clear active orders
              setActiveOrders([]);
            }
          }}
        >
          Combine Orders
          {!canMergeOrders && (
            <span
              style={{ left: mergeToolTipPositions.left, top: mergeToolTipPositions.top }}
              className="fixed top-0 opacity-0 group-hover/combine:opacity-100 pointer-events-none transition-opacity text-sm text-nowrap p-2 bg-gray-800 shadow-default rounded text-white"
            >
              <TbTriangleFilled className="absolute top-1/2 -translate-y-1/2 -left-2 -rotate-90 text-gray-800" />
              {activeOrders.length === 0
                ? 'Combining is disabled when no orders are selected'
                : 'Combining is only available for orders that were split'}
            </span>
          )}
        </DropDownItem>
      </DropDownContent>
    </DropDownContainer>
  );
};

export default PicklistHeader;
