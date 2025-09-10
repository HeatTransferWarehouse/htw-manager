import { TableHeadCell, TableHeader } from '../../../../Table/Table';
import { toggleSelectAll } from '../../utils/utils';
import { twMerge } from 'tailwind-merge';
import { FaCheck, FaMinus } from 'react-icons/fa';
import { HiOutlineArrowNarrowDown, HiOutlineArrowNarrowUp } from 'react-icons/hi';

function OrdersTableHead(props) {
  const { sort, ordersData, activeOrders, setActiveOrders, allSelected, handleSort } = props;

  const renderSortButton = (column, label) => (
    <button
      className="w-full p-2 whitespace-nowrap flex justify-between items-center gap-1 hover:bg-gray-100"
      onClick={(e) => handleSort(column)}
    >
      {label}
      {sort.sort_by === column &&
        (sort.order === 'asc' ? <HiOutlineArrowNarrowDown /> : <HiOutlineArrowNarrowUp />)}
    </button>
  );
  return (
    <TableHeader className={'bg-gray-200 border-y border-gray-400'}>
      <TableHeadCell
        className={'p-0 text-sm flex items-center justify-center gap-1'}
        minWidth={'4rem'}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSelectAll(activeOrders, setActiveOrders, ordersData, allSelected);
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
            <FaCheck className="w-[10px] h-[10px] text-white" />
          ) : activeOrders.length > 0 ? (
            <FaMinus className="w-[10px] h-[10px] text-white" />
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
    </TableHeader>
  );
}

export default OrdersTableHead;
