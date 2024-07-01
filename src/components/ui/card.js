import React from "react";
import { twMerge } from "tailwind-merge";

export const Card = ({ children, className, width }) => {
  const size = {
    "2xl": "max-w-screen-2xl",
    xl: "max-w-screen-xl",
    lg: "max-w-screen-lg",
    md: "max-w-screen-md",
    sm: "max-w-screen-sm",
  };
  return (
    <div
      className={twMerge(
        "bg-white shadow-default rounded-md p-4",
        size[width],
        className
      )}>
      {children}
    </div>
  );
};
