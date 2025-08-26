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
import { FaCheck, FaChevronRight } from 'react-icons/fa6';
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

function OrdersTable({
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
}) {
  const dispatch = useDispatch();

  const [sort, setSort] = useState({ sort_by: 'order_id', order: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalActive, setDeleteModalActive] = useState(false);

  const filteredData = useOrdersData(ordersData, sort, view, searchTerm);

  const handleSort = (sort_by) => {
    const newOrder = sort.sort_by === sort_by && sort.order === 'asc' ? 'desc' : 'asc';
    setSort({ sort_by, order: newOrder });
  };

  const handleSearch = (query) => {
    setSearchTerm(query.toLowerCase());
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

      <Table className={'max-w-[1900px] mx-auto'}>
        <PicklistHeader
          handleSearch={handleSearch}
          view={view}
          setView={setView}
          printOrders={printOrders}
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
            <TableHeadCell className={'p-0 text-sm'} minWidth={'4rem'} />
            <TableHeadCell className={'p-0 text-sm'} minWidth={'6rem'}>
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
            <TableHeadCell className={'text-sm border-l border-gray-400'} minWidth={'7rem'}>
              Print Time
            </TableHeadCell>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 &&
              filteredData.map((order, index) => {
                return (
                  <TableRow
                    className={order.is_printed && 'bg-green-600/10'}
                    key={index}
                    isMobile={false}
                  >
                    <TableCell minWidth={'4rem'} className={'flex p-2 items-center gap-1 mb-auto'}>
                      <button
                        className={twMerge(
                          order.line_items.length <= 1 && 'opacity-0 pointer-events-none'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (expandedOrderIDs.includes(order.order_id)) {
                            setExpandedOrderIDs((prev) =>
                              prev.filter((id) => id !== order.order_id)
                            );
                          } else {
                            setExpandedOrderIDs((prev) => [...prev, order.order_id]);
                          }
                        }}
                      >
                        {expandedOrderIDs.includes(order.order_id) ? (
                          <FaChevronRight className="w-4 h-4 rotate-90" />
                        ) : (
                          <FaChevronRight className="w-4 h-4 " />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeOrders.some((o) => o.order_id === order.order_id)) {
                            setActiveOrders((prev) =>
                              prev.filter((o) => o.order_id !== order.order_id)
                            );
                          } else {
                            setActiveOrders((prev) => [...prev, order]);
                          }
                        }}
                        className={twMerge(
                          'w-5 h-5 rounded border  flex items-center justify-center',
                          activeOrders.some((o) => o.order_id === order.order_id)
                            ? 'bg-secondary border-secondary'
                            : 'border-black bg-white'
                        )}
                      >
                        {activeOrders.some((o) => o.order_id === order.order_id) && (
                          <FaCheck className="w-3 h-3 text-white" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className={'mb-auto p-2'} minWidth={'6rem'}>
                      {order.order_id}
                    </TableCell>
                    <TableCell className={'mb-auto p-2'} minWidth={'6rem'}>
                      {new Date(order.created_at).toLocaleDateString('en-US')}
                    </TableCell>
                    <TableCell
                      className="mb-auto p-2 font-thin"
                      minWidth={'5rem'}
                      style={{
                        color: getAgeColor(ageToMinutes(order.age)),
                      }}
                    >
                      {order.age}
                    </TableCell>

                    <TableCell className={'mb-auto p-2'} minWidth={'10rem'}>
                      {order.status}
                    </TableCell>
                    <TableCell
                      className={twMerge(
                        'truncate overflow-hidden p-2 mb-auto whitespace-nowrap w-full',
                        expandedOrderIDs.includes(order.order_id) &&
                          'flex flex-col gap-2 items-start'
                      )}
                      minWidth={'10rem'}
                    >
                      {!expandedOrderIDs.includes(order.order_id) ? (
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
                          <span className="truncate  flex items-center w-full justify-between">
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
                          <div
                            className=" flex items-center gap-1 justify-between w-full"
                            key={idx}
                          >
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
                                title="Dropship Item"
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
                        expandedOrderIDs.includes(order.order_id) &&
                          'flex flex-col gap-2 items-start'
                      )}
                      minWidth={'10rem'}
                    >
                      {!expandedOrderIDs.includes(order.order_id) ? (
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
                      minWidth={'7rem'}
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
              })}
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
