import React from "react";
import { twMerge } from "tailwind-merge";

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

const TableContainer = ({ className, children }) => {
  return <div className={twMerge(className, "w-full")}>{children}</div>;
};

const TableHeader = ({ className, children, tableFor }) => {
  return (
    <div
      className={twMerge(
        className,
        "grid",
        tableFor === "clothing"
          ? "grid-cols-clothing"
          : tableFor === "supacolor"
          ? "grid-cols-supacolor"
          : "grid-cols-queue"
      )}>
      {children}
    </div>
  );
};

const TableRow = ({ className, children, isMobile, tableFor }) => {
  return (
    <div
      className={twMerge(
        className,
        isMobile
          ? "grid-cols-queueMobile"
          : tableFor === "clothing"
          ? "grid-cols-clothing"
          : tableFor === "supacolor"
          ? "grid-cols-supacolor"
          : "grid-cols-queue",
        "w-full grid relative"
      )}>
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
      className={twMerge(className, "p-2 font-bold flex items-center")}>
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
        className,
        "py-2 pl-4 flex items-center border-t border-solid border-gray-200",
        isMobile && "border-none"
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
