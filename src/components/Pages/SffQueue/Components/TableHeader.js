import React, { useState } from 'react';
import { useQueueActions } from '../Functions/queue-actions';
import { FaCheck } from 'react-icons/fa';
import { PiPlayBold } from 'react-icons/pi';
import { MdOutlineChecklistRtl } from 'react-icons/md';
import { CgTrash } from 'react-icons/cg';
import { BiReset } from 'react-icons/bi';
import { twMerge } from 'tailwind-merge';
import {
  Pagination,
  PaginationControls,
  PaginationOption,
  PaginationSheet,
  PaginationTrigger,
} from '../../../ui/pagination';
import { Pause } from '@material-ui/icons';

export function TableHeaderContainer({ props }) {
  const [allSelected, setAllSelected] = useState(false);
  const {
    startQueueItem,
    completeQueueItem,
    sendBackCompletedQueueItem,
    sendBackProgressQueueItem,
    holdQueueItem,
  } = useQueueActions();

  const handleSelectAll = () => {
    let pageItems = [];

    // Calculate start and end index based on current page and rows per page
    const startIndex = props.page * props.rowsPerPage;
    const endIndex = startIndex + props.rowsPerPage;

    // Get items for the current page
    pageItems = props.items.slice(startIndex, endIndex).map((item) => item.id);

    // Determine if all items on the current page are selected
    const allSelected =
      pageItems.length > 0 && pageItems.every((id) => props.checkedIds.includes(id));

    if (allSelected) {
      // Deselect all items on the current page
      props.setCheckedIds((prevIds) => prevIds.filter((id) => !pageItems.includes(id)));
    } else {
      // Select all items on the current page
      props.setCheckedIds((prevIds) => [...new Set([...prevIds, ...pageItems])]);
    }
  };

  const isAllSelected = () => {
    let pageItems = [];

    // Calculate start and end index based on current page and rows per page
    const startIndex = props.page * props.rowsPerPage;
    const endIndex = startIndex + props.rowsPerPage;

    // Get items for the current page
    pageItems = props.items.slice(startIndex, endIndex).map((item) => item.id);

    return pageItems.length > 0 && pageItems.every((id) => props.checkedIds.includes(id));
  };

  return (
    <div
      className={twMerge(
        'flex justify-between items-center py-2 border-t border-b border-solid border-gray-200'
      )}
    >
      <div
        style={{
          width: props.isMobile ? '100%' : 'fit-content',
        }}
        className="flex items-start md:items-center max-md:flex-col overflow-hidden"
      >
        <div
          className="flex items-center justify-between pl-2 pr-4"
          style={{
            width: props.isMobile ? '100%' : 'fit-content',
          }}
        >
          <span className="checkbox-container">
            <input
              style={{
                margin: '0px',
              }}
              className="checkbox-input"
              type="checkbox"
              id="select-all"
              checked={isAllSelected()}
              onChange={handleSelectAll}
            />
            <label htmlFor="select-all">
              <FaCheck />
            </label>
          </span>
          {props.checkedIds.length > 0 ? (
            <>
              <p>
                {props.checkedIds.length}/{props.items.length} Items
              </p>
            </>
          ) : (
            <>
              {' '}
              <p>{props.items.length} Items</p>
            </>
          )}
        </div>

        {allSelected ||
          (props.checkedIds.length > 0 &&
            (props.view === 'new' ? (
              <div className="flex items-center ml-2 max-md:pb-2 justify-center md:justify-start gap-2 grow snap-x overflow-x-auto">
                <button
                  className="w-fit min-w-fit flex items-center gap-2 whitespace-nowrap border border-solid text-green-600 hover:bg-green-600/10 border-green-600 rounded-md p-2"
                  onClick={(e) => {
                    startQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}
                >
                  Start
                  <PiPlayBold className="w-4 fill-green-600 h-4" />
                </button>
                <button
                  className="w-fit min-w-fit flex items-center gap-2 whitespace-nowrap border border-solid text-secondary hover:bg-secondary/10 border-secondary rounded-md p-2"
                  onClick={(e) => {
                    completeQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}
                >
                  Complete
                  <MdOutlineChecklistRtl className="fill-secondary w-6 h-6" />
                </button>
                <button
                  className="w-fit min-w-fit flex items-center gap-2 whitespace-nowrap border border-solid text-secondary hover:bg-secondary/10 border-secondary rounded-md p-2"
                  onClick={(e) => {
                    holdQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}
                >
                  Hold
                  <Pause className="w-6 h-6 fill-secondary" />
                </button>
                <button
                  className="w-fit min-w-fit flex items-center gap-2 whitespace-nowrap border border-solid text-red-600 hover:bg-red-600/10 border-red-600 rounded-md p-2"
                  onClick={(e) => {
                    props.setDeleteModalActive(props.checkedIds);
                    setAllSelected(false);
                  }}
                >
                  Delete
                  <CgTrash className="w-5 h-5 fill-red-600" />
                </button>
              </div>
            ) : props.view === 'progress' ? (
              <div className="flex items-center ml-2 max-md:pb-2 justify-center md:justify-start gap-2 grow snap-x overflow-x-auto">
                <button
                  className="w-fit min-w-fit flex items-center gap-2 whitespace-nowrap border border-solid text-secondary hover:bg-secondary/10 border-secondary rounded-md p-2"
                  onClick={(e) => {
                    completeQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}
                >
                  Complete
                  <MdOutlineChecklistRtl className="fill-secondary w-6 h-6" />
                </button>
                <button
                  className="w-fit min-w-fit flex items-center gap-2 whitespace-nowrap border border-solid text-secondary hover:bg-secondary/10 border-secondary rounded-md p-2"
                  onClick={(e) => {
                    sendBackProgressQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}
                >
                  Send to New
                  <BiReset className="w-6 h-6 fill-secondary" />
                </button>
                <button
                  className="w-fit min-w-fit flex items-center gap-2 whitespace-nowrap border border-solid text-secondary hover:bg-secondary/10 border-secondary rounded-md p-2"
                  onClick={(e) => {
                    holdQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}
                >
                  Hold
                  <Pause className="w-6 h-6 fill-secondary" />
                </button>
                <button
                  className="w-fit min-w-fit flex items-center gap-2 whitespace-nowrap border border-solid text-red-600 hover:bg-red-600/10 border-red-600 rounded-md p-2"
                  onClick={(e) => {
                    props.setDeleteModalActive(props.checkedIds);
                    setAllSelected(false);
                  }}
                >
                  Delete
                  <CgTrash className="w-5 h-5 fill-red-600" />
                </button>
              </div>
            ) : props.view === 'hold' ? (
              <div className="flex items-center ml-2 max-md:pb-2 justify-center md:justify-start gap-2 grow snap-x overflow-x-auto">
                <button
                  className="w-fit min-w-fit flex items-center gap-2 whitespace-nowrap border border-solid text-secondary hover:bg-secondary/10 border-secondary rounded-md p-2"
                  onClick={(e) => {
                    sendBackCompletedQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}
                >
                  Send to Progress
                  <BiReset className="w-6 h-6 fill-secondary" />
                </button>
                <button
                  className="w-fit min-w-fit flex items-center gap-2 whitespace-nowrap border border-solid text-secondary hover:bg-secondary/10 border-secondary rounded-md p-2"
                  onClick={(e) => {
                    sendBackProgressQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}
                >
                  Send to New
                  <BiReset className="w-6 h-6 fill-secondary" />
                </button>
                <button
                  className="w-fit min-w-fit flex items-center gap-2 whitespace-nowrap border border-solid text-secondary hover:bg-secondary/10 border-secondary rounded-md p-2"
                  onClick={(e) => {
                    completeQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}
                >
                  Complete
                  <MdOutlineChecklistRtl className="fill-secondary w-6 h-6" />
                </button>
                <button
                  className="w-fit min-w-fit flex items-center gap-2 whitespace-nowrap border border-solid text-red-600 hover:bg-red-600/10 border-red-600 rounded-md p-2"
                  onClick={(e) => {
                    props.setDeleteModalActive(props.checkedIds);
                    setAllSelected(false);
                  }}
                >
                  Delete
                  <CgTrash className="w-5 h-5 fill-red-600" />
                </button>
              </div>
            ) : (
              <div className="flex items-center ml-2 max-md:pb-2 justify-center md:justify-start gap-2 grow snap-x overflow-x-auto">
                <button
                  className="w-fit min-w-fit flex items-center gap-2 whitespace-nowrap border border-solid text-secondary hover:bg-secondary/10 border-secondary rounded-md p-2"
                  onClick={(e) => {
                    sendBackCompletedQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}
                >
                  Send to Progress
                  <BiReset className="w-6 h-6 fill-secondary" />
                </button>
                <button
                  className="w-fit min-w-fit flex items-center gap-2 whitespace-nowrap border border-solid text-secondary hover:bg-secondary/10 border-secondary rounded-md p-2"
                  onClick={(e) => {
                    sendBackProgressQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}
                >
                  Send to New
                  <BiReset className="w-6 h-6 fill-secondary" />
                </button>
                <button
                  className="w-fit min-w-fit flex items-center gap-2 whitespace-nowrap border border-solid text-secondary hover:bg-secondary/10 border-secondary rounded-md p-2"
                  onClick={(e) => {
                    holdQueueItem(e, props.checkedIds);
                    setAllSelected(false);
                    props.setCheckedIds([]);
                  }}
                >
                  Send to Hold
                  <Pause className="w-6 h-6 fill-secondary" />
                </button>
                <button
                  className="w-fit min-w-fit flex items-center gap-2 whitespace-nowrap border border-solid text-red-600 hover:bg-red-600/10 border-red-600 rounded-md p-2"
                  onClick={(e) => {
                    props.setDeleteModalActive(props.checkedIds);
                    setAllSelected(false);
                  }}
                >
                  Delete
                  <CgTrash className="w-5 h-5 fill-red-600" />
                </button>
              </div>
            )))}
      </div>
      {!props.isMobile && (
        <Pagination
          props={{
            itemsCount: props.items.length,
            rowsPerPage: props.rowsPerPage,
            setRowsPerPage: props.setRowsPerPage,
            page: props.page,
            setPage: props.setPage,
          }}
        >
          <PaginationTrigger />
          <PaginationControls />
          <PaginationSheet sheetPosition={'top'}>
            <PaginationOption value={10}>10</PaginationOption>
            <PaginationOption value={25}>25</PaginationOption>
            <PaginationOption value={50}>50</PaginationOption>
            <PaginationOption value={100}>100</PaginationOption>
          </PaginationSheet>
        </Pagination>
      )}
    </div>
  );
}
