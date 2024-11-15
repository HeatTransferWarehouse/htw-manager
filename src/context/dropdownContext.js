import React, { createContext, useContext, useState } from "react";

const DropDownManagerContext = createContext();

export const DropDownManagerProvider = ({ children }) => {
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const closeAllDropdowns = () => setActiveDropdownId(null);

  return (
    <DropDownManagerContext.Provider
      value={{ activeDropdownId, setActiveDropdownId, closeAllDropdowns }}>
      {children}
    </DropDownManagerContext.Provider>
  );
};

export const useDropDownManager = () => useContext(DropDownManagerContext);
