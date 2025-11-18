import { useEffect, useRef, useState } from 'react';
import { Table, TableBody, TableContainer } from '../../../../Table/Table';
import { FaUpRightAndDownLeftFromCenter, FaDownLeftAndUpRightToCenter } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';
import { useDispatch } from 'react-redux';
import { getOrderKey } from '../../utils/utils';
import {
  Pagination,
  PaginationControls,
  PaginationOption,
  PaginationSheet,
  PaginationTrigger,
} from '../../../../ui/pagination';
import ReactDOM from 'react-dom';
import DeleteModal from '../../modals/modals';
import PicklistHeader from './orders-table-header';
import LoadingSkeleton from '../loading-skeleton';
import OrdersTableRow from './orders-table-row';
import OrdersTableHead from './orders-table-head';

function OrdersTable(props) {
  const {
    isFullScreen,
    setIsFullScreen,
    ordersData,
    activeOrders,
    setActiveOrders,
    expandedOrderIDs,
    setExpandedOrderIDs,
    printOrders,
    view,
    syncing,
    orderTagsList,
    setRowsPerPage,
    setPage,
    page,
    rowsPerPage,
    ordersCount,
    setSearchTerm,
    searchTerm,
    loading,
    setType,
    filters,
    setFilters,
    lastSelectedOrder,
    setLastSelectedOrder,
  } = props;

  const dispatch = useDispatch();
  const noteRef = useRef(null);
  const [sort, setSort] = useState({ sort_by: 'order_id', order: 'desc' });
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [activeNotesId, setActiveNotesId] = useState(null);

  const allSelected =
    ordersData.length === 0
      ? false
      : ordersData.every((o) => activeOrders.some((a) => getOrderKey(a) === getOrderKey(o)));

  // Close notes popup if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (noteRef.current && !noteRef.current.contains(event.target)) {
        setActiveNotesId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [noteRef]);

  const handleSort = (sort_by) => {
    let newOrder;

    if (sort.sort_by === sort_by) {
      // Same column: toggle
      newOrder = sort.order === 'asc' ? 'desc' : 'asc';
    } else {
      // New column: start with desc
      newOrder = 'desc';
    }

    const newSort = { sort_by, order: newOrder };
    setSort(newSort);

    dispatch({
      type: 'GET_SFF_ORDERS',
      payload: {
        page: 1,
        limit: rowsPerPage,
        filter: view,
        search: searchTerm,
        sort: `${sort_by}_${newOrder}`,
      },
    });
  };

  const handleSearch = (query) => {
    const term = query.trim().toLowerCase().replace(/\s+/g, ' ');
    setSearchTerm(term);

    // reset to first page whenever a new search happens
    setPage(0);

    dispatch({
      type: 'GET_SFF_ORDERS',
      payload: { page: 1, limit: rowsPerPage, filter: view, search: term },
    });
  };

  const deleteOrders = () => {
    const orderIds = activeOrders.map((order) => order.order_id);
    if (orderIds.length === 0) return;

    dispatch({ type: 'DELETE_SFF_ORDERS', payload: orderIds });
    setDeleteModalActive(false);
    setActiveOrders([]);
  };

  const addOrderTag = (name, hex) => {
    dispatch({ type: 'ADD_ORDER_TAG', payload: { name, hex } });
  };

  const toggleNote = (noteId) => {
    if (activeNotesId === noteId) {
      setActiveNotesId(null);
    } else {
      setActiveNotesId(noteId);
    }
  };

  console.log(ordersData);

  return (
    <>
      <Table
        className={twMerge(
          'max-w-[1900px] mx-auto transition-all duration-150',
          isFullScreen && 'shadow-none max-w-full border-none w-full h-full m-0'
        )}
      >
        <div className="relative flex pt-4 items-center justify-center">
          <h2 className="text-2xl  font-semibold">Shirts From Fargo Picklist Management</h2>

          <button
            className={twMerge(
              'absolute right-4 text-sm flex p-2 hover:text-white hover:bg-secondary hover:border-secondary border-black items-center justify-center gap-2 rounded-md border'
            )}
            onClick={() => setIsFullScreen(!isFullScreen)}
          >
            {isFullScreen ? (
              <>
                Exit Fullscreen
                <FaDownLeftAndUpRightToCenter className=" w-3 h-3" />
              </>
            ) : (
              <>
                Enter Fullscreen
                <FaUpRightAndDownLeftFromCenter className=" w-3 h-3" />
              </>
            )}
          </button>
        </div>
        <PicklistHeader
          handleSearch={handleSearch}
          view={view}
          printOrders={printOrders}
          setActiveOrders={setActiveOrders}
          activeOrders={activeOrders}
          syncing={syncing}
          setDeleteModalActive={setDeleteModalActive}
          ordersData={ordersData}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          page={page}
          setPage={setPage}
          orderTagsList={orderTagsList}
          orderCount={ordersCount}
          setType={setType}
          filters={filters}
          setFilters={setFilters}
        />
        <TableContainer tableFor={'orders'}>
          <OrdersTableHead
            sort={sort}
            ordersData={ordersData}
            activeOrders={activeOrders}
            setActiveOrders={setActiveOrders}
            allSelected={allSelected}
            handleSort={handleSort}
          />
          <TableBody>
            {loading ? (
              <LoadingSkeleton limit={rowsPerPage} />
            ) : ordersData.length > 0 ? (
              ordersData.map((order, index) => {
                const orderKey = getOrderKey(order);
                const isSelected = activeOrders.some((o) => getOrderKey(o) === orderKey);
                const noteId =
                  order.shipment_number > 0
                    ? `${order.order_id}-${order.shipment_number}`
                    : order.order_id;

                return (
                  <OrdersTableRow
                    key={orderKey}
                    orders={ordersData}
                    order={order}
                    index={index}
                    orderIndex={index}
                    isSelected={isSelected}
                    expandedOrderIDs={expandedOrderIDs}
                    setExpandedOrderIDs={setExpandedOrderIDs}
                    activeNotesId={activeNotesId}
                    setActiveNotesId={setActiveNotesId}
                    noteRef={noteRef}
                    toggleNote={toggleNote}
                    activeOrders={activeOrders}
                    setActiveOrders={setActiveOrders}
                    noteId={noteId}
                    orderKey={orderKey}
                    lastSelectedOrder={lastSelectedOrder}
                    setLastSelectedOrder={setLastSelectedOrder}
                  />
                );
              })
            ) : (
              <p className="text-xl col-span-full text-center mx-auto my-8 text-gray-500">
                No orders found
              </p>
            )}
          </TableBody>
        </TableContainer>
        <div className="border-t border-gray-300 ">
          <Pagination
            props={{
              itemsCount: ordersCount,
              rowsPerPage: rowsPerPage,
              setRowsPerPage: setRowsPerPage,
              page: page,
              setPage: setPage,
            }}
          >
            <PaginationTrigger />
            <PaginationControls />
            <PaginationSheet sheetPosition={'bottom'}>
              <PaginationOption value={25}>25</PaginationOption>
              <PaginationOption value={50}>50</PaginationOption>
              <PaginationOption value={100}>100</PaginationOption>
              <PaginationOption value={250}>250</PaginationOption>
            </PaginationSheet>
          </Pagination>
        </div>
      </Table>
      {deleteModalActive &&
        ReactDOM.createPortal(
          <DeleteModal
            activeOrders={activeOrders}
            onConfirm={deleteOrders}
            onCancel={() => setDeleteModalActive(false)}
          />,
          document.body
        )}
    </>
  );
}

export default OrdersTable;
