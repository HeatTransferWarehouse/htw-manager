import { useState, useEffect, useRef } from "react";

const usePullToRefresh = (onRefresh) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const mainRef = useRef(null);

  const isMobileDevice = () => {
    return /Mobi|Android/i.test(navigator.userAgent);
  };

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (isMobileDevice() && e.target === mainRef.current) {
        setStartY(e.touches[0].clientY);
        setIsDragging(true);
      }
    };

    const handleTouchMove = (e) => {
      if (isDragging) {
        setCurrentY(e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      if (isDragging && currentY - startY > 100) {
        // Threshold for triggering refresh
        onRefresh();
      }
      setIsDragging(false);
      setStartY(0);
      setCurrentY(0);
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, startY, currentY, onRefresh]);

  return mainRef;
};

export default usePullToRefresh;
