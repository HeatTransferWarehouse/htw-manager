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

function PicklistHeader({
  handleSearch,
  view,
  setView,
  printOrders,
  activeOrders,
  syncing,
  setDeleteModalActive,
  filteredData,
  rowsPerPage,
  setRowsPerPage,
  page,
  setPage,
  orderTagsList,
  orderCount,
}) {
  const location = useLocation();
  const pathname = location.pathname;

  const dispatch = useDispatch();
  return (
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

export default PicklistHeader;
