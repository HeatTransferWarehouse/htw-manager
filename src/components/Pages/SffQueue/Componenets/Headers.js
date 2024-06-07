import React from "react";
import { Link, useLocation } from "react-router-dom";
import { RiPencilFill } from "react-icons/ri";
import { HiMiniListBullet } from "react-icons/hi2";
import { PiListChecks } from "react-icons/pi";

export function Header({ count }) {
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view") || "new"; // Default to 'new' if no parameter is present

  return (
    <div className="sff-queue-container">
      <Link
        className={`queue-header-link ${view === "new" ? "active" : ""}`}
        to={`${pathname}?view=new`}>
        <RiPencilFill fill="white" />
        New ({count.newCount})
      </Link>
      <Link
        className={`queue-header-link ${view === "progress" ? "active" : ""}`}
        to={`${pathname}?view=progress`}>
        <HiMiniListBullet fill="white" />
        In Progress ({count.inProgressCount})
      </Link>
      <Link
        className={`queue-header-link ${view === "completed" ? "active" : ""}`}
        to={`${pathname}?view=completed`}>
        <PiListChecks
          style={{ width: "1.25rem", height: "1.25rem" }}
          fill="white"
        />
        Complete ({count.completedCount})
      </Link>
    </div>
  );
}
