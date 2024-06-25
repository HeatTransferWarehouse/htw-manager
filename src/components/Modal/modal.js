import React, { forwardRef } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { twMerge } from "tailwind-merge";

const ModalOverlay = forwardRef(({ children, handleClick, open }, ref) => {
  return (
    <div
      onClick={handleClick}
      ref={ref}
      className={twMerge(
        open
          ? "opacity-100 duration-200"
          : "opacity-0 pointer-events-none duration-500",
        "fixed top-0 w-full flex transition items-center max-md:items-end justify-center h-full left-0 bg-black/75 overflow-hidden z-[999]"
      )}>
      {children}
    </div>
  );
});

const Modal = ({ children, open, className }) => {
  return (
    <div
      className={twMerge(
        className,
        open ? "translate-y-0" : "translate-y-[100%] md:translate-y-[200%]",
        "bg-white relative overflow-hidden max-md:rounded-t-xl duration-200 transition max-md:rounded-b-none flex flex-col max-md:max-h-[80%] z-[9999] px-4 pb-4 w-full max-w-[1000px] rounded-md shadow-default"
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
        className,
        "absolute max-md:hidden right-4 top-4 w-8 h-8 flex item justify-center"
      )}>
      <IoIosCloseCircle className="w-full h-full hover:fill-red-500" />
    </button>
  );
};

const ModalContent = ({ children, className }) => {
  return (
    <div
      className={twMerge(
        className,
        "flex flex-col gap-4 pt-4 grow overflow-y-scroll"
      )}>
      {children}
    </div>
  );
};

export {
  ModalOverlay,
  Modal,
  ModalCloseMobile,
  ModalCloseDesktop,
  ModalContent,
};
