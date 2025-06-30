import React, { useEffect, useRef, useState } from "react";
import { Card } from "./card";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { IoClose } from "react-icons/io5";

function Popover({ children, className, open }) {
  if (!open) return null;

  return createPortal(
    <div
      className={twMerge(
        "bg-white z-[1234213] w-full h-full fixed top-0 left-0",
        className
      )}
      aria-modal="true"
      tabIndex={-1}
      role="dialog">
      {children}
    </div>,
    document.body
  );
}

export default Popover;
