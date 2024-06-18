import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

const Table = ({ className, children }) => {
  return (
    <div
      className={twMerge(
        className,
        "w-[calc(100%-2rem)] max-w-screen-2xl mx-auto bg-white my-8 rounded-md shadow-default"
      )}>
      {children}
    </div>
  );
};

const TableContainer = ({ className, children }) => {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setHeight(528);
      } else {
        setHeight(0);
      }
    };
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });
  return (
    <div
      style={{
        height: height > 0 ? height : "",
      }}
      className={twMerge(
        className,
        "w-full overflow-y-auto h-fit max-md:overflow-x-scroll max-md:h-[400px]"
      )}>
      {children}
    </div>
  );
};

const TableHeader = ({ className, children }) => {
  return (
    <div className={twMerge(className, "grid grid-cols-queue")}>{children}</div>
  );
};

const TableRow = ({ className, children, isMobile }) => {
  return (
    <div
      className={twMerge(
        className,
        isMobile ? "grid-cols-queueMobile" : "grid-cols-queue",
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
