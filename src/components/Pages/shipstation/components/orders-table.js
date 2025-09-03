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
import { FaRegCopy } from 'react-icons/fa6';

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
}) {
  const dispatch = useDispatch();

  const [sort, setSort] = useState({ sort_by: 'order_id', order: 'desc' });

  const [deleteModalActive, setDeleteModalActive] = useState(false);

  const filteredData = useOrdersData(ordersData, sort, view, searchTerm);

  const handleSort = (sort_by) => {
    const newOrder = sort.sort_by === sort_by && sort.order === 'asc' ? 'desc' : 'asc';
    const newSort = { sort_by, order: newOrder };

    setSort(newSort);

    dispatch({
      type: 'GET_ORDERS',
      payload: {
        page: 1, // reset to first page on new sort
        limit: rowsPerPage, // whatever your pagination size is
        filter: view, // whatever filter you’re using
        search: searchTerm, // if you have a search box
        sort: `${sort_by}_${newOrder}`, // backend expects combined key
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
                  allSelected ? 'bg-secondary border-secondary' : 'border-black bg-white'
                )}
              >
                {allSelected && <FaCheck className="w-3 h-3 text-white" />}
              </button>
            </TableHeadCell>
            <TableHeadCell className={'p-0 text-sm'} minWidth={'9rem'}>
              {renderSortButton('order_id', 'Order #')}
            </TableHeadCell>
            <TableHeadCell className={'p-0 text-sm border-l border-gray-400'} minWidth={'7rem'}>
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
            <TableHeadCell className={'text-sm border-l border-gray-400'} minWidth={'4.5rem'}>
              Quantity
            </TableHeadCell>
            <TableHeadCell className={'text-sm border-l border-gray-400'} minWidth={'8rem'}>
              Shipping Total
            </TableHeadCell>
            <TableHeadCell className={'text-sm border-l border-gray-400'} minWidth={'7rem'}>
              Order Total
            </TableHeadCell>
            <TableHeadCell className={'text-sm border-l border-gray-400'} minWidth={'12.5rem'}>
              Print Time
            </TableHeadCell>
          </TableHeader>
          <TableBody>
            {loading ? (
              <LoadingSkeleton limit={rowsPerPage} />
            ) : filteredData.length > 0 ? (
              filteredData.map((order, index) => {
                const orderKey = getOrderKey(order);

                return (
                  <TableRow
                    className={order.is_printed && 'bg-green-600/10'}
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

                    <TableCell className="mb-auto  p-2" minWidth="9rem">
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
                    </TableCell>
                    <TableCell className="mb-auto p-2" minWidth="7rem">
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
                      minWidth={'4.5rem'}
                    >
                      {!expandedOrderIDs.includes(order.order_id)
                        ? order.total_items
                        : order.line_items.map((product, idx) => (
                            <div className="text-right ml-auto" key={idx}>
                              {product.quantity}
                            </div>
                          ))}
                    </TableCell>
                    <TableCell className={'mb-auto flex justify-end p-2'} minWidth={'8rem'}>
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
                      minWidth={'12.5rem'}
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
