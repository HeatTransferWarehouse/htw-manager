import React from "react";
import { Link, useLocation } from "react-router-dom";
import { twMerge } from "tailwind-merge";

export function TableNav({ props }) {
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("status") || "enabled"; // Default to 'new' if no parameter is present

  return (
    <div className="flex justify-center items-center w-fit mx-auto p-4 gap-2">
      <Link
        className={twMerge(
          "max-sm:w-1/3 max-sm:flex max-sm:flex-col rounded-md font-medium p-2 text-secondary   hover:text-white hover:bg-secondary ",
          view === "all" && "bg-secondary  text-white"
        )}
        to={`${pathname}?status=all`}>
        All
      </Link>
      <Link
        className={twMerge(
          "max-sm:w-1/3 max-sm:flex max-sm:flex-col rounded-md font-medium p-2 text-secondary   hover:text-white hover:bg-secondary ",
          view === "enabled" && "bg-secondary  text-white"
        )}
        to={`${pathname}?status=enabled`}>
        Active
      </Link>
      <Link
        className={twMerge(
          "max-sm:w-1/3 max-sm:flex max-sm:flex-col rounded-md font-medium p-2 text-secondary   hover:text-white hover:bg-secondary ",
          view === "disabled" && "bg-secondary  text-white"
        )}
        to={`${pathname}?status=disabled`}>
        Inactive
      </Link>
    </div>
  );
}
