import React, { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

function DropDownContainer({ children, className }) {
  const [hovering, setHovering] = useState(false);
  const ref = useRef(null);
  const width = ref.current?.scrollWidth;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={twMerge(className, "relative")}>
      {/* Pass `hovering` as a prop to the children if needed */}
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { hovering, width })
      )}
    </div>
  );
}

function DropDownTrigger({ children, className, hovering }) {
  return (
    <div
      className={twMerge(
        className,
        hovering ? "bg-gray-200" : "",
        "cursor-pointer p-2 rounded-md flex items-center justify-start gap-2"
      )}>
      {children}
      <span className="ml-4 flex items-center justify-center">
        {hovering ? <FaChevronUp /> : <FaChevronDown />}
      </span>
    </div>
  );
}

function DropDownContent({ children, className, hovering, width }) {
  return (
    <div
      className={twMerge(
        className,
        hovering ? "block" : "hidden",
        "absolute bg-white overflow-hidden shadow-default w-fit rounded-md right-0"
      )}
      style={{
        width: width + "px",
      }}>
      {children}
    </div>
  );
}

function DropDownItem({ children, className }) {
  return (
    <div className={twMerge(className, "p-2 hover:bg-gray-100 cursor-pointer")}>
      {children}
    </div>
  );
}

export { DropDownContainer, DropDownTrigger, DropDownContent, DropDownItem };
