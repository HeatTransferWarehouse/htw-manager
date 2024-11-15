import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { twMerge } from "tailwind-merge";

export default function LoadingOverlay({ className, title, secondaryText }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div
        className={twMerge(
          className,
          "bg-white p-4 flex flex-col gap-4 items-center justify-center rounded-md shadow-default"
        )}>
        {title && secondaryText && (
          <span className="flex flex-col gap-1 items-center justify-center">
            {title && <p className="text-xl">{title}</p>}
            {secondaryText && <p className="text-sm">{secondaryText}</p>}
          </span>
        )}
        <AiOutlineLoading3Quarters className="animate-spin w-10 h-10 text-primary" />
      </div>
    </div>
  );
}
