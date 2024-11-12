import React, { useState } from "react";
import { FaCircleInfo } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";

const ToolTip = ({ className, children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="relative">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { hovered, setHovered })
      )}
    </div>
  );
};

const ToolTipIcon = ({ className, setHovered }) => {
  return (
    <FaCircleInfo
      className={twMerge(className, "w-4 h-4")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    />
  );
};

const ToolTipPanel = ({ children, className, hovered, size }) => {
  const sizes = {
    sm: "w-48",
    md: "w-64",
    lg: "w-80",
  };
  return (
    <div
      className={twMerge(
        className,
        sizes[size],
        hovered ? "block" : "hidden",
        "bg-white rounded-md text-sm font-normal shadow-default p-2 absolute left-0 top-full mt-2  z-50"
      )}>
      {children}
    </div>
  );
};

export { ToolTip, ToolTipIcon, ToolTipPanel };
