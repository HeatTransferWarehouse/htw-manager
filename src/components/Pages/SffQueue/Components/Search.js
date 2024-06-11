// Search.js
import React, { useState } from "react";
import { IoSearchSharp } from "react-icons/io5";

const Search = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="search-container">
      <span className="search-span">
        <input
          type="text"
          placeholder="Search by order number, SKU, or product name"
          value={query}
          onChange={handleInputChange}
          className="search-input"
        />
        <IoSearchSharp />
      </span>
    </div>
  );
};

export default Search;
