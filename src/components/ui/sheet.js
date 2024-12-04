import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { IoIosCloseCircle } from "react-icons/io";

const Sheet = ({
  className,
  children,
  position = "center",
  type = "center",
  animate = true,
  open: controlledOpen,
  onClose,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [renderContent, setRenderContent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOpen !== undefined ? onClose : setInternalOpen;

  useEffect(() => {
    if (isOpen) {
      setRenderContent(true);
      // Delay to trigger animation
      setTimeout(() => setMounted(true), 50);
    } else {
      setMounted(false);
      // Delay unmounting until animation completes
      const timer = setTimeout(() => setRenderContent(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const positionClasses = {
    top: "top-0",
    bottom: "bottom-0",
    left: "left-0 top-0",
    right: "right-0 top-0",
    center: "",
  };

  const sheetTransformationClasses = {
    top: mounted ? "translate-y-0" : "-translate-y-full",
    bottom: mounted ? "translate-y-0" : "translate-y-full",
    left: mounted ? "translate-x-0" : "-translate-x-full",
    right: mounted ? "translate-x-0" : "translate-x-full",
    center: mounted ? "translate-x-0" : "-translate-x-full",
  };

  const typeClasses = {
    side: "w-full max-w-[400px] h-full",
    center: "w-full max-w-[600px] max-h-[600px]",
  };

  return renderContent
    ? createPortal(
        <div
          className="bg-black/50 fixed z-[100000] top-0 left-0 w-full h-full flex items-center justify-center"
          onClick={() => setOpen(false)}>
          <div
            className={twMerge(
              className,
              sheetTransformationClasses[position],
              positionClasses[position],
              typeClasses[type],
              animate ? "transition-transform duration-300" : "",
              "bg-white absolute shadow-md px-4 pb-4 overflow-y-auto"
            )}
            onClick={(e) => e.stopPropagation()}>
            {React.Children.map(children, (child) => {
              return React.cloneElement(child, { setOpen });
            })}
          </div>
        </div>,
        document.querySelector("#react-root")
      )
    : null;
};

const SheetTrigger = ({ className, children, setOpen }) => {
  return (
    <button
      onClick={() => setOpen(true)}
      className={twMerge(
        className,
        "border-none cursor-pointer hover:bg-secondary/15 rounded-md bg-transparent w-fit h-fit p-2 m-0"
      )}>
      {children}
    </button>
  );
};

const SheetContent = ({ children }) => {
  return <div>{children}</div>;
};

const SheetHeader = ({ className, children, setOpen, title }) => {
  return (
    <div className="py-4 sticky top-0 z-50 bg-white flex-col">
      <div className="pb-4 flex justify-between items-center">
        <span className="text-xl font-bold">{title}</span>
        <button
          className="flex group/close-sheet items-center justify-center m-0 p-0 border-none bg-transparent"
          onClick={() => setOpen(false)}>
          <IoIosCloseCircle className="fill-black transition group-hover/close-sheet:fill-red-500 w-8 h-8" />
        </button>
      </div>
      {children}
    </div>
  );
};

export { SheetTrigger, Sheet, SheetContent, SheetHeader };
