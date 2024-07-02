import React from "react";
import { twMerge } from "tailwind-merge";

export const Button = ({ children, onClick, className, variant, type }) => {
  const styles = {
    primary: "bg-primary hover:bg-primary/85 text-white",
    secondary: "bg-secondary hover:bg-secondary/85 text-white",
    danger: "bg-red-600 hover:bg-red-600/85 text-white",
    warning: "bg-yellow-600 hover:bg-yellow-600/85 text-white",
    success: "bg-green-600 hover:bg-green-600/85 text-white",
    neutral: "bg-gray-300 hover:bg-gray-300/85 text-black",
    ghost:
      "bg-transparent hover:bg-secondary/85 text-secondary hover:text-white",
  };

  return (
    <button
      onClick={onClick}
      className={twMerge(
        "rounded-md py-2 w-fit h-fit px-4 font-medium flex items-center justify-center gap-2",
        styles[variant],
        className
      )}
      type={type}>
      {children}
    </button>
  );
};
