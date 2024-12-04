import React, { createContext, useContext } from "react";
import { twMerge } from "tailwind-merge";

const TableContext = createContext();

// Utility function for getting the table grid class
const getTableGridClass = (tableFor, isMobile = false) => {
  const tableGridClasses = {
    clothing: "grid-cols-clothing",
    supacolor: "grid-cols-supacolor",
    promos: "grid-cols-promos",
    sff: "grid-cols-sff",
    productsListImages: "grid-cols-productsListImages",
    productsList: "grid-cols-productsList",
    queue: isMobile ? "grid-cols-queueMobile" : "grid-cols-queue",
  };
  return tableGridClasses[tableFor] || "";
};

const Table = ({ className, children }) => {
  return (
    <div
      className={twMerge(
        className,
        "w-[calc(100%-2rem)] animate-in opacity-0 max-w-screen-2xl mx-auto bg-white my-8 rounded-md shadow-default"
      )}>
      {children}
    </div>
  );
};

const TableContainer = ({ className, children, tableFor }) => {
  return (
    <TableContext.Provider value={{ tableFor }}>
      <div className={twMerge("w-full", className)}>{children}</div>
    </TableContext.Provider>
  );
};

// TableHeader
const TableHeader = ({ className, children }) => {
  const { tableFor } = useContext(TableContext);
  const tableGridClass = getTableGridClass(tableFor);
  return (
    <div className={twMerge("grid", tableGridClass, className)}>{children}</div>
  );
};

// TableRow Component
const TableRow = ({ className, children, isMobile }) => {
  const { tableFor } = useContext(TableContext);
  const tableGridClass = getTableGridClass(tableFor, isMobile);
  return (
    <div className={twMerge("w-full grid relative", tableGridClass, className)}>
      {children}
    </div>
  );
};

const TableBody = ({ className, children }) => {
  return <div className={twMerge(className)}>{children}</div>;
};

const TableHeadCell = ({ className, children, minWidth }) => {
  return (
    <span
      style={{
        minWidth: minWidth,
      }}
      className={twMerge("p-2 font-bold flex items-center", className)}>
      {children}
    </span>
  );
};

const TableCell = ({ className, children, minWidth, isMobile }) => {
  return (
    <span
      style={{
        minWidth: minWidth,
      }}
      className={twMerge(
        "py-2 pl-4 flex items-center border-t border-solid border-gray-200",
        isMobile && "border-none",
        className
      )}>
      {children}
    </span>
  );
};

export {
  Table,
  TableCell,
  TableHeader,
  TableBody,
  TableContainer,
  TableHeadCell,
  TableRow,
};
