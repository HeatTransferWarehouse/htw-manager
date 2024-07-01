import React, { forwardRef } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { twMerge } from "tailwind-merge";

const ModalOverlay = forwardRef(
  ({ children, className, handleClick, open }, ref) => {
    return (
      <div
        onClick={handleClick}
        ref={ref}
        className={twMerge(
          open
            ? "opacity-100 duration-200"
            : "opacity-0 pointer-events-none duration-500",
          "fixed top-0 w-full flex transition items-center max-md:items-end justify-center h-full left-0 bg-black/75 overflow-hidden z-[999]",
          className
        )}>
        {children}
      </div>
    );
  }
);

const Modal = ({ children, open, className, width }) => {
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
        open ? "translate-y-0" : "translate-y-[100%] md:translate-y-[200%]",
        "bg-white relative overflow-hidden max-md:rounded-t-xl duration-200 transition max-md:rounded-b-none flex flex-col max-md:max-h-[80%] z-[9999] p-4 w-full rounded-md shadow-default",
        size[width],
        className
      )}>
      {children}
    </div>
  );
};

const ModalCloseMobile = forwardRef(({ bind }, ref) => {
  return (
    <div
      className="flex items-center justify-center min-h-12 md:hidden h-12 top-0 w-full bg-white z-[999999]"
      style={{
        touchAction: "none",
      }}
      ref={ref}
      {...bind()}>
      <span className="w-20 h-[5px] flex mx-auto rounded-full bg-black/25" />
    </div>
  );
});

const ModalCloseDesktop = ({ handleClick, className }) => {
  return (
    <button
      onClick={handleClick}
      className={twMerge(
        "absolute max-md:hidden right-4 top-4 w-8 h-8 flex item justify-center",
        className
      )}>
      <IoIosCloseCircle className="w-full h-full hover:fill-red-500" />
    </button>
  );
};

const ModalContent = ({ children, className }) => {
  return (
    <div
      className={twMerge(
        "flex flex-col gap-4 pt-4 grow overflow-y-scroll",
        className
      )}>
      {children}
    </div>
  );
};

const ModalTitle = ({ children, className }) => {
  return (
    <h2 className={twMerge("text-2xl font-bold text-center", className)}>
      {children}
    </h2>
  );
};

export {
  ModalOverlay,
  Modal,
  ModalCloseMobile,
  ModalCloseDesktop,
  ModalContent,
  ModalTitle,
};
