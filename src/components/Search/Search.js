import React, { useState, useRef, useEffect } from "react";

// Function to detect the user's operating system
const detectOS = () => {
  const platform = window.navigator.platform.toLowerCase();
  return platform.includes("mac") ? "mac" : "pc";
};

const Search = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const os = detectOS(); // Detect OS when component mounts
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
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
    <div className="search-container">
      <span className="search-span">
        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={handleInputChange}
          className="search-input"
          ref={inputRef}
        />
        <span>{os === "mac" ? "⌘K" : "CtrlK"}</span>
      </span>
    </div>
  );
};

export default Search;
