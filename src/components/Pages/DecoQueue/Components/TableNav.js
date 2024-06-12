import React from "react";
import { Link, useLocation } from "react-router-dom";

export function TableNav({ count }) {
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view") || "new"; // Default to 'new' if no parameter is present

  return (
    <div className="sff-queue-table-nav">
      <Link
        className={`queue-header-link ${view === "new" ? "active" : ""}`}
        to={`${pathname}?view=new`}>
        New ({count.newCount})
      </Link>
      <Link
        className={`queue-header-link ${view === "progress" ? "active" : ""}`}
        to={`${pathname}?view=progress`}>
        In Progress ({count.inProgressCount})
      </Link>
      <Link
        className={`queue-header-link ${view === "completed" ? "active" : ""}`}
        to={`${pathname}?view=completed`}>
        Completed ({count.completedCount})
      </Link>
    </div>
  );
}
