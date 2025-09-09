import {
  ageToMinutes,
  formatMoney,
  getAgeColor,
  getOrderKey,
  toggleSelectOrder,
} from '../../utils/utils';
import { twMerge } from 'tailwind-merge';
import { FaXmark } from 'react-icons/fa6';
import { LuNotebookText } from 'react-icons/lu';
import { FaCheck, FaChevronRight } from 'react-icons/fa';
import { TableCell, TableRow } from '../../../../Table/Table';

function OrdersTableRow(props) {
  const {
    order,
    orderKey,
    isSelected,
    expandedOrderIDs,
    setExpandedOrderIDs,
    activeOrders,
    setActiveOrders,
    activeNotesId,
    setActiveNotesId,
    noteId,
    noteRef,
    toggleNote,
  } = props;
  return (
    <TableRow
      className={isSelected ? 'bg-secondary/10' : order.is_printed && 'bg-green-600/10'}
      isMobile={false}
    >
      <TableCell minWidth={'4rem'} className="flex p-2 items-center gap-1 mb-auto">
        {/* Expand button */}
        <button
          className={twMerge(order.line_items.length <= 1 && 'opacity-0 pointer-events-none')}
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
            toggleSelectOrder(activeOrders, setActiveOrders, order);
          }}
          className={twMerge(
            'w-5 h-5 rounded border flex items-center justify-center',
            activeOrders.some((o) => getOrderKey(o) === orderKey)
              ? 'bg-secondary border-secondary'
              : 'border-black bg-white'
          )}
        >
          {activeOrders.some((o) => getOrderKey(o) === orderKey) && (
            <FaCheck className="w-[10px] h-[10px] text-white" />
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
              toggleNote(noteId);
            }}
          >
            <LuNotebookText className="w-4 h-4" />
          </button>
        )}
        {activeNotesId === noteId && (
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
                    return <span className="bg-yellow-400 rounded-md h-6 w-[6px]" key={item.id} />;
                  }
                  if (item.is_clothing) {
                    return <span className="bg-blue-700 rounded-md h-6 w-[6px]" key={item.id} />;
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
                <span title="Clothing Item" className="bg-blue-700 text-white rounded-md h-6 px-1">
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
        className={twMerge('mb-auto p-2', order.is_printed && 'text-green-800 font-medium')}
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
}

export default OrdersTableRow;
