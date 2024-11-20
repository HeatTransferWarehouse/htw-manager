import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { twMerge } from "tailwind-merge";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "../../ui/sheet";
import { Input } from "../../Form/form";
import { FaFilter } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import Search from "./searchProductsInput";
import { FaSyncAlt } from "react-icons/fa";

import {
  Pagination,
  PaginationControls,
  PaginationOption,
  PaginationSheet,
  PaginationTrigger,
} from "../../ui/pagination";

export default function TableHeaderContainer({ props }) {
  const {
    syncCatalog,
    lastSync,
    selectedCategoryFilters,
    filteredCategories,
    filteredProducts,
    page,
    rowsPerPage,
    searchQuery,
    setSearchQuery,
    setSelectedCategoryFilters,
    setPage,
    position,
    setRowsPerPage,
    productSearchQuery,
    setProductSearchQuery,
    handleCategoryFilterChange,
    isMobile,
    activeSyncStatus,
  } = props;
  const [sync, setSync] = useState("No sync data available");
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (lastSync.data && lastSync.data.length > 0) {
      const unFormattedLastSync = new Date(lastSync.data[0]?.date);
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/Chicago", // Central Time
      };
      setSync(unFormattedLastSync.toLocaleString("en-US", options));
    }
  }, [lastSync]);

  const handleAllClearFilters = () => {
    setSelectedCategoryFilters([]);
  };

  return (
    <div
      className={twMerge(
        "flex justify-between items-end flex-col md:flex-row p-2 border-b border-solid border-gray-200"
      )}>
      <div className="md:flex-grow max-md:w-full p-4 max-md:grid max-md:grid-cols-2">
        <Search
          className="max-md:col-span-2"
          props={{
            productSearchQuery,
            setProductSearchQuery,
          }}
        />
        <div className="w-full max-md:col-span-1 flex flex-col gap-2 items-start">
          <Button
            className={"w-[130px]"}
            variant={"secondary"}
            disabled={activeSyncStatus.data}
            onClick={syncCatalog}>
            {activeSyncStatus.data ? "Syncing..." : "Sync Catalog"}
          </Button>
          {!activeSyncStatus.data ? (
            <span className="text-xs flex mt-2 text-gray-500">
              Last Sync: {sync}
            </span>
          ) : (
            <span className="text-xs flex mt-2 text-gray-500">
              <FaSyncAlt className="w-3 mr-2 p-0 relative top-[2px] h-3 animate-spin fill-gray-500" />
              Syncing in progress
            </span>
          )}
        </div>
        {isMobile && (
          <div className="flex col-span-1 items-start justify-end">
            <SheetTrigger
              className={
                "flex items-center justify-center gap-2 group hover:text-secondary transition"
              }
              setOpen={setSheetOpen}>
              Filters{" "}
              <FaFilter className="w-4 h-4 fill-black group-hover:fill-secondary transition" />
            </SheetTrigger>
          </div>
        )}
        {isMobile && selectedCategoryFilters.length > 0 && (
          <div className="flex items-center mt-4 col-span-2 overflow-y-auto gap-2">
            {selectedCategoryFilters.map((category) => {
              return (
                <span
                  className="bg-gray-200 whitespace-nowrap max-w-fit min-w-fit flex gap-2 items-center rounded-md p-2 overflow-hidden"
                  key={category}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedCategoryFilters(
                        selectedCategoryFilters.filter(
                          (selectedCategory) => selectedCategory !== category
                        )
                      );
                    }}
                    className="p-1 rounded-full m-0 border-none bg-transparent hover:bg-gray-300 flex items-center justify-center">
                    <IoClose className="w-3 h-3" />
                  </button>
                  {category}
                </span>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex items-center justify-center">
        <div className="flex gap-2 items-center justify-center">
          {!isMobile && (
            <SheetTrigger
              className={
                "flex items-center justify-center gap-2 group hover:text-secondary transition"
              }
              setOpen={setSheetOpen}>
              Filters
              <FaFilter className="w-4 h-4 fill-black group-hover:fill-secondary transition" />
            </SheetTrigger>
          )}
          {!isMobile && selectedCategoryFilters.length > 0 && (
            <div className="flex items-center max-w-[500px] overflow-x-auto gap-2">
              {selectedCategoryFilters.map((category) => {
                return (
                  <span
                    className="bg-gray-200 whitespace-nowrap min-w-fit flex gap-2 items-center rounded-md p-2 overflow-hidden"
                    key={category}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedCategoryFilters(
                          selectedCategoryFilters.filter(
                            (selectedCategory) => selectedCategory !== category
                          )
                        );
                      }}
                      className="p-1 rounded-full m-0 border-none bg-transparent hover:bg-gray-300 flex items-center justify-center">
                      <IoClose className="w-3 h-3" />
                    </button>
                    {category}
                  </span>
                );
              })}
            </div>
          )}
          <Sheet
            title="Filters"
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            position="right"
            type="side"
            animate={true}>
            <SheetContent>
              <SheetHeader title="Filters" setOpen={setSheetOpen}>
                {selectedCategoryFilters.length > 0 && (
                  <>
                    <span
                      className="hover:underline hover:cursor-pointer hover:text-secondary"
                      onClick={handleAllClearFilters}>
                      Clear all
                    </span>
                    <div className="flex max-h-[136px] overflow-y-auto my-4 items-center flex-wrap gap-2">
                      {selectedCategoryFilters.map((category) => {
                        return (
                          <span
                            className="bg-gray-200 whitespace-nowrap max-w-48 flex gap-2 items-center rounded-md p-2 overflow-hidden"
                            key={category}>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedCategoryFilters(
                                  selectedCategoryFilters.filter(
                                    (selectedCategory) =>
                                      selectedCategory !== category
                                  )
                                );
                              }}
                              className="p-1 rounded-full m-0 border-none bg-transparent hover:bg-gray-300 flex items-center justify-center">
                              <IoClose className="w-3 h-3" />
                            </button>
                            {category}
                          </span>
                        );
                      })}
                    </div>
                  </>
                )}
                <h2 className="font-semibold text-base">Categories</h2>
                <Input
                  type="text"
                  placeholder="Search categories"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-4"
                />
              </SheetHeader>
              {filteredCategories.map((category) => (
                <label
                  key={category.name}
                  className="block hover:cursor-pointer mb-2">
                  <input
                    className="hover:cursor-pointer"
                    type="checkbox"
                    checked={selectedCategoryFilters.includes(category.name)}
                    onChange={() => handleCategoryFilterChange(category.name)}
                  />
                  {category.name} ({category.count})
                </label>
              ))}
            </SheetContent>
          </Sheet>
        </div>
        <Pagination
          props={{
            items: filteredProducts,
            rowsPerPage: rowsPerPage,
            page: page,
            setPage: setPage,
            position: position,
            setRowsPerPage: setRowsPerPage,
          }}>
          <PaginationTrigger />
          <PaginationControls />
          <PaginationSheet sheetPosition={"top"}>
            <PaginationOption value={10}>10</PaginationOption>
            <PaginationOption value={25}>25</PaginationOption>
            <PaginationOption value={50}>50</PaginationOption>
            <PaginationOption value={100}>100</PaginationOption>
          </PaginationSheet>
        </Pagination>
      </div>
    </div>
  );
}
