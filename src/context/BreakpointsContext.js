import React, { createContext, useState, useEffect } from "react";

// Define your breakpoints
const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

export const BreakpointsContext = createContext();

export const BreakpointsProvider = ({ children }) => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState("desktop");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < breakpoints.mobile) {
        setCurrentBreakpoint("mobile");
      } else if (width < breakpoints.tablet) {
        setCurrentBreakpoint("tablet");
      } else {
        setCurrentBreakpoint("desktop");
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <BreakpointsContext.Provider value={currentBreakpoint}>
      {children}
    </BreakpointsContext.Provider>
  );
};
