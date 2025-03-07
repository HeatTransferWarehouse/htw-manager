import React, { useState, useRef, useEffect } from "react";
import { IoIosClose } from "react-icons/io";
import { twMerge } from "tailwind-merge";

// Function to detect the user's operating system
const detectOS = () => {
  const platform = window.navigator.platform.toLowerCase();
  return platform.includes("mac") ? "mac" : "pc";
};

const Search = ({ props, className }) => {
  const os = detectOS(); // Detect OS when component mounts
  const inputRef = useRef(null);
  const [showClearInput, setShowClearInput] = useState(false);
  const { productSearchQuery, setProductSearchQuery } = props;

  const handleInputClear = (bool) => {
    setShowClearInput(bool);
    setProductSearchQuery("");
    inputRef.current.focus();
  };

  const handleInputChange = (e) => {
    setProductSearchQuery(e.target.value);
    if (e.target.value.length > 1) {
      setShowClearInput(true);
    } else {
      setShowClearInput(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className={twMerge("w-full max-w-[500px] mb-4", className)}>
      <span className="relative w-full max-w-[500px] flex items-center">
        <input
          type="text"
          placeholder="Search"
          value={productSearchQuery}
          onChange={handleInputChange}
          className="w-full m-0 p-2 shadow-default border border-solid border-transparent rounded-md focus:outline-none placeholder:text-gray-600 focus:ring-4 focus:border-secondary focus:ring-secondary/15 hover:border-secondary"
          ref={inputRef}
        />
        <span className="absolute text-gray-600 right-2 h-5 w-fit flex items-center ">
          {showClearInput && (
            <button
              className="w-8 h-8 relative left-1 rounded-full group/clear transition duration-200 hover:bg-secondary/10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleInputClear(false);
              }}>
              <IoIosClose className="w-full transition duration-200 hover/group-clear:fill-secondary fill-gray-600 h-full" />
            </button>
          )}
          {!showClearInput && (
            <span className="max-lg:hidden">
              {os === "mac" ? "⌘K" : "CtrlK"}
            </span>
          )}
        </span>
      </span>
    </div>
  );
};

export default Search;
