import React, { useEffect, useMemo, useState } from 'react';
import { HiOutlineArrowNarrowUp, HiOutlineArrowNarrowDown } from 'react-icons/hi';
import {
  Table,
  TableBody,
  TableContainer,
  TableHeadCell,
  TableHeader,
  TableRow,
  TableCell,
} from '../../../Table/Table';
import {
  FaCheck,
  FaChevronRight,
  FaUpRightAndDownLeftFromCenter,
  FaDownLeftAndUpRightToCenter,
  FaX,
  FaXmark,
  FaMinus,
} from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';
import { useDispatch } from 'react-redux';
import {
  DropDownContainer,
  DropDownContent,
  DropDownItem,
  DropDownTrigger,
} from '../../../ui/dropdown';
import { ageToMinutes, formatMoney, getAgeColor } from '../utils/utils';
import {
  Pagination,
  PaginationControls,
  PaginationOption,
  PaginationSheet,
  PaginationTrigger,
} from '../../../ui/pagination';
import ReactDOM from 'react-dom';
import DeleteModal from '../modals/modals';
import PicklistHeader from './table-header';
import useOrdersData from '../hooks/useOrdersData';
import LoadingSkeleton from './loading-skeleton';
import { LuNotebookText } from 'react-icons/lu';

import OrderDetails from './order-details';

function OrdersTable({
  isFullScreen,
  setIsFullScreen,
  ordersData,
  activeOrders,
  setActiveOrders,
  expandedOrderIDs,
  setExpandedOrderIDs,
  printOrders,
  view,
  setView,
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
}) {
  const dispatch = useDispatch();
  const noteRef = React.useRef(null);
  const [sort, setSort] = useState({ sort_by: 'order_id', order: 'desc' });

  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [activeNotesId, setActiveNotesId] = useState(null);

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

  const filteredData = useOrdersData(ordersData, sort, view, searchTerm);

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
      type: 'GET_ORDERS',
      payload: {
        page: 1,
        limit: rowsPerPage,
        filter: view,
        search: searchTerm,
        sort: `${sort_by}_${newOrder}`,
      },
    });
  };

  const getOrderKey = (order) => `${order.order_id}-${order.shipment_number || order.id}`;

  const handleSearch = (query) => {
    const term = query.trim().toLowerCase().replace(/\s+/g, ' ');
    setSearchTerm(term);

    // reset to first page whenever a new search happens
    setPage(0);

    dispatch({
      type: 'GET_ORDERS',
      payload: { page: 1, limit: rowsPerPage, filter: view, search: term },
    });
  };

  const deleteOrders = () => {
    const orderIds = activeOrders.map((order) => order.order_id);
    if (orderIds.length === 0) return;

    dispatch({ type: 'DELETE_ORDERS', payload: orderIds });
    setDeleteModalActive(false);
    setActiveOrders([]);
  };

  const renderSortButton = (column, label) => (
    <button
      className="w-full p-2 whitespace-nowrap flex justify-between items-center gap-1 hover:bg-gray-100"
      onClick={(e) => handleSort(column)}
    >
      {label}
      {sort.sort_by === column &&
        (sort.order === 'asc' ? <HiOutlineArrowNarrowUp /> : <HiOutlineArrowNarrowDown />)}
    </button>
  );

  const addOrderTag = (name, hex) => {
    dispatch({ type: 'ADD_ORDER_TAG', payload: { name, hex } });
  };

  const allSelected =
    filteredData.length === 0
      ? false
      : filteredData.every((o) => activeOrders.some((a) => getOrderKey(a) === getOrderKey(o)));

  return (
    <>
      {deleteModalActive &&
        ReactDOM.createPortal(
          <DeleteModal
            activeOrders={activeOrders}
            onConfirm={deleteOrders}
            onCancel={() => setDeleteModalActive(false)}
          />,
          document.body
        )}

      <Table
        className={twMerge(
          'max-w-[1900px] mx-auto transition-all duration-150',
          isFullScreen && 'shadow-none max-w-full border-none w-full h-full m-0'
        )}
      >
        <div className="relative flex pt-4 items-center justify-center">
          <h2 className="text-2xl  font-semibold">Picklist Management</h2>

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
          filteredData={filteredData}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          page={page}
          setPage={setPage}
          orderTagsList={orderTagsList}
          orderCount={ordersCount}
          setType={setType}
        />
        <TableContainer tableFor={'orders'}>
          <TableHeader className={'bg-gray-200 border-y border-gray-400'}>
            <TableHeadCell
              className={'p-0 text-sm flex items-center justify-center gap-1'}
              minWidth={'4rem'}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (allSelected) {
                    // Deselect all
                    setActiveOrders((prev) =>
                      prev.filter(
                        (o) => !filteredData.some((p) => getOrderKey(p) === getOrderKey(o))
                      )
                    );
                  } else if (activeOrders.length > 0) {
                    // Deselect all
                    setActiveOrders((prev) =>
                      prev.filter(
                        (o) => !filteredData.some((p) => getOrderKey(p) === getOrderKey(o))
                      )
                    );
                  } else {
                    // Select all
                    const newOrders = filteredData.filter(
                      (o) => !activeOrders.some((a) => getOrderKey(a) === getOrderKey(o))
                    );
                    setActiveOrders((prev) => [...prev, ...newOrders]);
                  }
                }}
                className={twMerge(
                  'w-5 h-5 rounded border ml-3 flex items-center justify-center',
                  allSelected
                    ? 'bg-secondary border-secondary'
                    : activeOrders.length > 0
                      ? 'bg-secondary border-secondary'
                      : 'border-black bg-white'
                )}
              >
                {allSelected ? (
                  <FaCheck className="w-3 h-3 text-white" />
                ) : activeOrders.length > 0 ? (
                  <FaMinus className="w-3 h-3 text-white" />
                ) : (
                  ''
                )}
              </button>
            </TableHeadCell>
            <TableHeadCell className={'p-0 text-sm'} minWidth={'9.5rem'}>
              {renderSortButton('order_id', 'Order #')}
            </TableHeadCell>
            <TableHeadCell className={'p-0 text-sm border-l border-gray-400'} minWidth={'6.5rem'}>
              {renderSortButton('created_at', 'Order Date')}
            </TableHeadCell>
            <TableHeadCell className={'p-0 text-sm border-l border-gray-400'} minWidth={'5rem'}>
              {renderSortButton('age', 'Age')}
            </TableHeadCell>
            <TableHeadCell className={'text-sm border-l border-gray-400'} minWidth={'10rem'}>
              Status
            </TableHeadCell>
            <TableHeadCell className={'text-sm border-l border-gray-400 '} minWidth={'10rem'}>
              Item Sku
            </TableHeadCell>
            <TableHeadCell className={'text-sm border-l border-gray-400'} minWidth={'10rem'}>
              Item Name
            </TableHeadCell>
            <TableHeadCell className={'text-sm border-l border-gray-400'} minWidth={'10rem'}>
              Recipient
            </TableHeadCell>
            <TableHeadCell className={'text-sm border-l border-gray-400'} minWidth={'8rem'}>
              Shipping Method
            </TableHeadCell>
            <TableHeadCell className={'text-sm border-l border-gray-400'} minWidth={'3rem'}>
              Qty
            </TableHeadCell>
            <TableHeadCell className={'text-sm border-l border-gray-400'} minWidth={'6.75rem'}>
              Shipping Total
            </TableHeadCell>
            <TableHeadCell className={'text-sm border-l border-gray-400'} minWidth={'7rem'}>
              Order Total
            </TableHeadCell>
            <TableHeadCell className={'text-sm border-l border-gray-400'} minWidth={'12rem'}>
              Print Time
            </TableHeadCell>
            {/* <TableHeadCell className={'text-sm border-l p-0 border-gray-400'} minWidth={'5rem'}>
              {renderSortButton('pick_list_complete', 'Picked')}
            </TableHeadCell> */}
          </TableHeader>
          <TableBody>
            {loading ? (
              <LoadingSkeleton limit={rowsPerPage} />
            ) : filteredData.length > 0 ? (
              filteredData.map((order, index) => {
                const orderKey = getOrderKey(order);
                const isSelected = activeOrders.some((o) => getOrderKey(o) === orderKey);

                return (
                  <TableRow
                    className={
                      isSelected ? 'bg-secondary/10' : order.is_printed && 'bg-green-600/10'
                    }
                    key={orderKey} // use unique key here too
                    isMobile={false}
                  >
                    <TableCell minWidth={'4rem'} className="flex p-2 items-center gap-1 mb-auto">
                      {/* Expand button */}
                      <button
                        className={twMerge(
                          order.line_items.length <= 1 && 'opacity-0 pointer-events-none'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (expandedOrderIDs.includes(orderKey)) {
                            setExpandedOrderIDs((prev) => prev.filter((id) => id !== orderKey));
                          } else {
                            setExpandedOrderIDs((prev) => [...prev, orderKey]);
                          }
                        }}
                      >
                        {expandedOrderIDs.includes(orderKey) ? (
                          <FaChevronRight className="w-4 h-4 rotate-90" />
                        ) : (
                          <FaChevronRight className="w-4 h-4 " />
                        )}
                      </button>

                      {/* Select checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeOrders.some((o) => getOrderKey(o) === orderKey)) {
                            setActiveOrders((prev) =>
                              prev.filter((o) => getOrderKey(o) !== orderKey)
                            );
                          } else {
                            setActiveOrders((prev) => [...prev, order]);
                          }
                        }}
                        className={twMerge(
                          'w-5 h-5 rounded border flex items-center justify-center',
                          activeOrders.some((o) => getOrderKey(o) === orderKey)
                            ? 'bg-secondary border-secondary'
                            : 'border-black bg-white'
                        )}
                      >
                        {activeOrders.some((o) => getOrderKey(o) === orderKey) && (
                          <FaCheck className="w-3 h-3 text-white" />
                        )}
                      </button>
                    </TableCell>

                    <TableCell className="mb-auto relative p-2" minWidth="9.5rem">
                      <a
                        className="text-secondary flex items-center gap-1 relative group"
                        target="_blank"
                        href={`https://store-et4qthkygq.mybigcommerce.com/manage/orders/${order.order_id}`}
                      >
                        {order.order_id}
                      </a>
                      {order.is_split && (
                        <span className="ml-1 text-sm text-gray-600">
                          ({order.shipment_number} of {order.total_shipments})
                        </span>
                      )}
                      {(order.customer_notes || order.staff_notes) && (
                        <button
                          title="View Order Notes"
                          className={twMerge(
                            'absolute w-6 h-6 flex items-center text-gray-700 justify-center hover:bg-secondary/10 hover:text-secondary rounded-md right-[0.1rem]',
                            activeNotesId &&
                              activeNotesId ===
                                (order.shipment_number > 0
                                  ? `${order.order_id}-${order.shipment_number}`
                                  : order.order_id) &&
                              'bg-secondary/10 text-secondary'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              activeNotesId &&
                              activeNotesId ===
                                (order.shipment_number > 0
                                  ? `${order.order_id}-${order.shipment_number}`
                                  : order.order_id)
                            ) {
                              setActiveNotesId(null);
                            } else {
                              setActiveNotesId(
                                order.shipment_number > 0
                                  ? `${order.order_id}-${order.shipment_number}`
                                  : order.order_id
                              );
                            }
                          }}
                        >
                          <LuNotebookText className="w-4 h-4" />
                        </button>
                      )}
                      {activeNotesId &&
                        activeNotesId ===
                          (order.shipment_number > 0
                            ? `${order.order_id}-${order.shipment_number}`
                            : order.order_id) && (
                          <div
                            ref={noteRef}
                            className="bg-white z-50 absolute text-sm left-0 w-80 top-12 rounded-md border border-gray-200 shadow-default overflow-hidden"
                          >
                            <h2 className="text-lg flex justify-between items-center font-medium bg-gray-100 border-b border-gray-200 p-2 mb-2">
                              <p>
                                Order Notes: <span className="font-semibold">{activeNotesId}</span>
                              </p>
                              <FaXmark
                                className="w-4 h-4 cursor-pointer hover:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveNotesId(null);
                                }}
                              />
                            </h2>
                            <p className="font-medium p-2">
                              Customer Notes:{' '}
                              {order.customer_notes ? (
                                <span className="ml-1 font-normal">{order.customer_notes}</span>
                              ) : (
                                <span className="text-gray-500 ml-1 font-normal">N/A</span>
                              )}
                            </p>
                            <p className="font-medium p-2">
                              Staff Notes:{' '}
                              {order.staff_notes ? (
                                <span className="ml-1 font-normal">{order.staff_notes}</span>
                              ) : (
                                <span className="text-gray-500 ml-1 font-normal">N/A</span>
                              )}
                            </p>
                          </div>
                        )}
                    </TableCell>
                    <TableCell className="mb-auto p-2" minWidth="6.5rem">
                      {new Date(order.created_at).toLocaleDateString('en-US')}
                    </TableCell>
                    <TableCell
                      className="mb-auto p-2 font-thin"
                      minWidth="5rem"
                      style={{ color: getAgeColor(ageToMinutes(order.age)) }}
                    >
                      {order.age}
                    </TableCell>

                    <TableCell className="mb-auto p-2" minWidth="10rem">
                      {order.status}
                    </TableCell>
                    <TableCell
                      className={twMerge(
                        'truncate overflow-hidden p-2 mb-auto whitespace-nowrap w-full',
                        expandedOrderIDs.includes(orderKey) && 'flex flex-col gap-2 items-start'
                      )}
                      minWidth="10rem"
                    >
                      {!expandedOrderIDs.includes(orderKey) ? (
                        order.line_items.length > 1 ? (
                          <span className="flex items-center w-full justify-between">
                            ({order.line_items.length} Items)
                            <span className="flex items-center gap-1">
                              {order.line_items.map((item, index) => {
                                if (item.is_dropship) {
                                  return (
                                    <span
                                      className="bg-yellow-400 rounded-md h-6 w-[6px]"
                                      key={item.id}
                                    />
                                  );
                                }
                                if (item.is_clothing) {
                                  return (
                                    <span
                                      className="bg-blue-700 rounded-md h-6 w-[6px]"
                                      key={item.id}
                                    />
                                  );
                                }
                              })}
                            </span>
                          </span>
                        ) : (
                          <span className="truncate flex items-center w-full justify-between">
                            <span className="w-full truncate">{order.line_items[0].sku}</span>
                            {order.line_items[0].is_dropship ? (
                              <span className="bg-yellow-400 rounded-md h-6 w-[6px]" />
                            ) : order.line_items[0].is_clothing ? (
                              <span className="bg-blue-700 rounded-md h-6 w-[6px]" />
                            ) : (
                              ''
                            )}
                          </span>
                        )
                      ) : (
                        order.line_items.map((product, idx) => (
                          <div className="flex items-center gap-1 justify-between w-full" key={idx}>
                            <span className="truncate w-full">{product.sku}</span>
                            {product.is_dropship ? (
                              <span
                                title="Dropship Item"
                                className="bg-yellow-400 text-black rounded-md h-6 px-1"
                              >
                                {product.name.toLowerCase().includes('supacolor') ? 'SC DS' : 'DS'}
                              </span>
                            ) : product.is_clothing ? (
                              <span
                                title="Clothing Item"
                                className="bg-blue-700 text-white rounded-md h-6 px-1"
                              >
                                CL
                              </span>
                            ) : (
                              ''
                            )}
                          </div>
                        ))
                      )}
                    </TableCell>

                    <TableCell
                      className={twMerge(
                        'truncate mb-auto p-2 w-full',
                        expandedOrderIDs.includes(orderKey) && 'flex flex-col gap-2 items-start'
                      )}
                      minWidth="10rem"
                    >
                      {!expandedOrderIDs.includes(orderKey) ? (
                        order.line_items.length > 1 ? (
                          `(${order.line_items.length} Items)`
                        ) : (
                          <span className="truncate w-full">{order.line_items[0].name}</span>
                        )
                      ) : (
                        order.line_items.map((product, idx) => (
                          <div className="truncate w-full" key={idx}>
                            {product.name}
                          </div>
                        ))
                      )}
                    </TableCell>

                    <TableCell className={'mb-auto p-2'} minWidth={'8rem'}>
                      <span className="truncate w-full">
                        {order.customer.company
                          ? order.customer.company
                          : `${order.customer.first_name} ${order.customer.last_name}`}
                      </span>
                    </TableCell>

                    <TableCell className={' mb-auto p-2'} minWidth={'8rem'}>
                      <span className="truncate w-full">{order.shipping.shipping_method}</span>
                    </TableCell>
                    <TableCell
                      className={'mb-auto w-full flex flex-col gap-2 items-end text-right p-2'}
                      minWidth={'3rem'}
                    >
                      {!expandedOrderIDs.includes(order.order_id)
                        ? order.total_items
                        : order.line_items.map((product, idx) => (
                            <div className="text-right ml-auto" key={idx}>
                              {product.quantity}
                            </div>
                          ))}
                    </TableCell>
                    <TableCell className={'mb-auto flex justify-end p-2'} minWidth={'6.75rem'}>
                      {formatMoney(order.shipping.cost_inc_tax)}
                    </TableCell>
                    <TableCell className={'mb-auto flex justify-end p-2'} minWidth={'7rem'}>
                      {formatMoney(Number(order.grand_total))}
                    </TableCell>
                    <TableCell
                      className={twMerge(
                        'mb-auto p-2',
                        order.is_printed && 'text-green-800 font-medium'
                      )}
                      minWidth={'12rem'}
                    >
                      {order.printed_time
                        ? new Date(order.printed_time).toLocaleString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })
                        : 'N/A'}
                    </TableCell>
                    {/* <TableCell className={'mb-auto flex justify-center p-2'} minWidth={'5rem'}>
                      <span
                        className={twMerge(
                          'w-5 h-5 flex items-center justify-center rounded border border-secondary',
                          order.pick_list_complete
                            ? 'bg-secondary text-white'
                            : 'bg-white text-white'
                        )}
                      >
                        <FaCheck className="w-4 h-4" />
                      </span>
                    </TableCell> */}
                  </TableRow>
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
    </>
  );
}

const TagsDropdown = ({ activeOrders, orderTagsList, setManageTagsOpen }) => {
  return (
    <DropDownContainer type="click">
      <DropDownTrigger className="w-full hover:border-secondary border text-lg border-black justify-between">
        Tag
      </DropDownTrigger>
      <DropDownContent>
        <DropDownItem
          onClick={() => setManageTagsOpen(true)}
          className={twMerge('text-black border-b border-gray-400 text-base')}
        >
          Manage Tags
        </DropDownItem>
        {orderTagsList.length === 0 ? (
          <DropDownItem
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className={twMerge(
              'text-gray-500 text-nowrap text-sm hover:bg-white hover:text-gray-500'
            )}
          >
            No Tags Created
          </DropDownItem>
        ) : (
          orderTagsList.map((tag, index) => {
            <DropDownItem
              disabled={activeOrders.length === 0}
              className={twMerge('text-black text-base hover:bg-white hover:text-black')}
            >
              {tag.name}
            </DropDownItem>;
          })
        )}
      </DropDownContent>
    </DropDownContainer>
  );
};

export default OrdersTable;
