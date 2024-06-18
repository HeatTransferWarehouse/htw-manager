import React, { useState, useRef, useEffect } from "react";
import { IoIosClose } from "react-icons/io";

// Function to detect the user's operating system
const detectOS = () => {
  const platform = window.navigator.platform.toLowerCase();
  return platform.includes("mac") ? "mac" : "pc";
};

const Search = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const os = detectOS(); // Detect OS when component mounts
  const inputRef = useRef(null);
  const [showClearInput, setShowClearInput] = useState(false);

  const handleInputClear = (bool) => {
    setShowClearInput(bool);
    setQuery("");
    onSearch("");
    inputRef.current.focus();
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
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
    <div className="w-full px-4 mb-4">
      <span className="relative w-full max-w-[500px] flex items-center">
        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={handleInputChange}
          className="w-full m-0 p-2 shadow-default rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent hover:outline-none hover:ring-2 hover:ring-primary/50 hover:border-transparent"
          ref={inputRef}
        />
        <span className="absolute text-gray-400 right-2 h-5 w-fit flex items-center ">
          {showClearInput && (
            <button
              className="w-8 h-8 relative left-1 rounded-full group/clear transition duration-200 hover:bg-secondary/10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleInputClear(false);
              }}>
              <IoIosClose className="w-full transition duration-200 hover/group-clear:fill-secondary fill-gray-400 h-full" />
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
