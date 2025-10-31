import React, { useState, useRef, useEffect } from 'react';
import { IoIosClose } from 'react-icons/io';
import { HiOutlineSearch } from 'react-icons/hi';

// Function to detect the user's operating system
const detectOS = () => {
  const platform = window.navigator.platform.toLowerCase();
  return platform.includes('mac') ? 'mac' : 'pc';
};

const Search = ({ onSearch, className }) => {
  const [query, setQuery] = useState('');
  const os = detectOS(); // Detect OS when component mounts
  const inputRef = useRef(null);
  const [showClearInput, setShowClearInput] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleInputClear = (bool) => {
    setShowClearInput(bool);
    setQuery('');
    onSearch('');
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
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const baseTokens = [
    { label: 'status:', desc: 'Match order status' },
    { label: 'customer:', desc: 'Match customer email or name' },
    { label: 'sku:', desc: 'Match product SKU' },
    { label: 'product:', desc: 'Match product name' },
    { label: 'company:', desc: 'Match shipping company' },
    { label: 'shipping:', desc: 'Match shipping method' },
  ];

  const customerSubTokens = [
    { label: 'customer:email:', desc: 'Match customer email' },
    { label: 'customer:first_name:', desc: 'Match customer first name' },
    { label: 'customer:last_name:', desc: 'Match customer last name' },
  ];

  return (
    <span className="relative flex items-center">
      <HiOutlineSearch className="absolute left-2 w-5 h-5" />
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search orders"
        className="pl-8 focus:outline-secondary py-2 w-[26rem] m-0 text-lg rounded border border-black hover:border-secondary"
        ref={inputRef}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <span className="absolute text-gray-600 right-2 h-5 w-fit flex items-center ">
        {showClearInput && (
          <button
            className="w-8 h-8 relative left-1 rounded-full group/clear transition duration-200 hover:bg-secondary/10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleInputClear(false);
            }}
          >
            <IoIosClose className="w-full transition duration-200 hover/group-clear:fill-secondary fill-gray-600 h-full" />
          </button>
        )}
        {!showClearInput && <span className="max-lg:hidden">{os === 'mac' ? '⌘K' : 'CtrlK'}</span>}
      </span>
      {focused && (query.length === 0 || query.trim().toLowerCase() === 'customer:') && (
        <div className="w-full absolute rounded z-[20349582304958] left-0 top-14 bg-white border border-gray-200 shadow-default">
          <p className="text-base p-3 text-gray-600">Search Filters:</p>
          <ul className="list-none p-0 m-0">
            {query.trim().toLowerCase() === 'customer:'
              ? customerSubTokens.map((token) => (
                  <li key={token.label}>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-secondary/10 flex items-center justify-between"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setQuery(token.label);
                        inputRef.current.focus();
                      }}
                    >
                      <span className="font-medium text-sm">{token.label}</span>
                      <span className="text-xs text-gray-500">{token.desc}</span>
                    </button>
                  </li>
                ))
              : baseTokens.map((token) => (
                  <li key={token.label}>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-secondary/10 flex items-center justify-between"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setQuery(token.label);
                        inputRef.current.focus();
                      }}
                    >
                      <span className="font-medium text-sm">{token.label}</span>
                      <span className="text-xs text-gray-500">{token.desc}</span>
                    </button>
                  </li>
                ))}
          </ul>
        </div>
      )}
    </span>
  );
};

export default Search;
