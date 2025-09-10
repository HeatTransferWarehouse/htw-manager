import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  useLayoutEffect,
} from 'react';
import { twMerge } from 'tailwind-merge';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa6';
import { createPortal } from 'react-dom';
import { useDropDownManager } from '../../context/dropdownContext';

// Create a Context for dropdown state
const DropDownContext = createContext();

const DropDownContainer = ({ children, className, onClose, type = 'hover' }) => {
  const { activeDropdownId, setActiveDropdownId, closeAllDropdowns } = useDropDownManager();
  const triggerRef = useRef(null);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [dropdownstyle, setDropdownstyle] = useState({});

  // Generate a unique ID for each dropdown instance using useRef
  const uniqueIdRef = useRef(Symbol('dropdown-id'));
  const uniqueId = uniqueIdRef.current;

  // Check if this dropdown is open based on the unique ID
  const isOpen = activeDropdownId === uniqueId;

  const toggleOpen = () => {
    if (isOpen) {
      closeAllDropdowns();
    } else {
      setActiveDropdownId(uniqueId);
    }
  };

  const closeDropdown = () => {
    if (isOpen) closeAllDropdowns();
  };

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    setDropdownstyle({
      buttonWidth: rect.width,
      positionX: rect.x,
      positionY: rect.y,
      triggerHeight: rect.height,
    });
  }, []);

  useEffect(() => {
    const mainContainer = document.querySelector('.main-container');
    if (!mainContainer) return;

    const handleScrollResize = () => {
      requestAnimationFrame(calculatePosition);
    };

    mainContainer.addEventListener('scroll', handleScrollResize);
    window.addEventListener('resize', handleScrollResize);

    calculatePosition();

    return () => {
      mainContainer.removeEventListener('scroll', handleScrollResize);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, [calculatePosition]);

  useLayoutEffect(() => {
    if (type === 'hover') return;
    const handleClickOutside = (event) => {
      if (!isOpen) return;
      if (!triggerRef.current || !contentRef.current) return;

      if (
        !triggerRef.current.contains(event.target) &&
        !contentRef.current.contains(event.target)
      ) {
        closeDropdown();
        onClose?.(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [type, isOpen, onClose]);

  return (
    <DropDownContext.Provider
      value={{
        isOpen,
        toggleOpen,
        closeDropdown,
        dropdownstyle,
        type,
        containerRef,
        triggerRef,
        contentRef,
        calculatePosition,
      }}
    >
      <div
        ref={containerRef}
        onMouseEnter={() => type === 'hover' && setActiveDropdownId(uniqueId)}
        onMouseLeave={() => type === 'hover' && closeAllDropdowns()}
        className={twMerge('relative pb-2 top-1', className)}
      >
        {React.Children.map(children, (child) => {
          if (child.type === DropDownTrigger) {
            return React.cloneElement(child, {
              ref: triggerRef,
            });
          }
          return child;
        })}
      </div>
    </DropDownContext.Provider>
  );
};

const DropDownTrigger = forwardRef(({ children, className, onClick, ...props }, ref) => {
  const { isOpen, toggleOpen, type, triggerRef, calculatePosition } = useContext(DropDownContext);

  return (
    <button
      ref={ref || triggerRef} // ✅ use the ref passed in, fallback to context
      className={twMerge(
        isOpen ? 'bg-secondary/10' : '',
        'cursor-pointer group p-2 rounded-md transition hover:text-secondary flex items-center justify-start gap-4',
        className
      )}
      onClick={(e) => {
        onClick && onClick(e);
        calculatePosition();
        if (type !== 'hover') toggleOpen();
      }}
      onMouseEnter={() => type === 'hover' && calculatePosition()}
      {...props}
    >
      {children}
      {type !== 'popover' && (
        <span className="pointer-events-none flex items-center justify-center">
          {isOpen ? (
            <FaChevronUp className="group-hover:text-secondary" />
          ) : (
            <FaChevronDown className="group-hover:text-secondary" />
          )}
        </span>
      )}
    </button>
  );
});

const DropDownContent = ({ children, className, style }) => {
  const { isOpen, dropdownstyle, triggerRef, contentRef } = useContext(DropDownContext);
  const [isVisible, setIsVisible] = useState(false); // controls render
  const [animate, setAnimate] = useState(false); // controls CSS animation
  const [isPositioned, setIsPositioned] = useState({});

  // Open animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true); // mount
      requestAnimationFrame(() =>
        setTimeout(() => {
          setAnimate(true);
        }, 5)
      ); // trigger transition
    } else {
      setAnimate(false); // start exit
      setIsVisible(false); // unmount
    }
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isVisible || !contentRef.current || !triggerRef.current) return;

    const { offsetWidth, scrollHeight } = contentRef.current;
    const { buttonWidth, positionX, positionY, triggerHeight } = dropdownstyle;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let top = triggerRef.current.getBoundingClientRect().top + triggerHeight;
    let left = positionX;
    let isBottom = false;
    let isRight = false;

    if (top + scrollHeight > viewportHeight) {
      top = positionY - scrollHeight;
      isBottom = true;
    }

    if (left + offsetWidth > viewportWidth) {
      isRight = true;
    }

    setIsPositioned({
      width: Math.max(buttonWidth, contentRef.current.scrollWidth),
      left: isRight ? 'unset' : left,
      right: isRight ? viewportWidth - positionX - buttonWidth : 'unset',
      top: isBottom ? 'unset' : top,
      bottom: isBottom ? viewportHeight - positionY + 4 : 'unset',
    });
  }, [isVisible, dropdownstyle, contentRef, triggerRef]);

  if (!isVisible || !triggerRef.current) return null;

  return createPortal(
    <div
      ref={contentRef}
      className={twMerge(
        'fixed z-[999999999999999999] rounded-md h-fit max-h-[200px] flex flex-col w-fit overflow-x-hidden overflow-y-auto bg-white shadow-default transition-all duration-100',
        animate ? 'translate-y-1' : 'translate-y-0',
        className
      )}
      style={{ ...style, ...isPositioned }}
    >
      {children}
    </div>,
    document.body
  );
};

const DropDownItem = forwardRef(
  ({ children, className, onClick, active, disableCloseOnClick = false, ...rest }, ref) => {
    const { closeDropdown } = useContext(DropDownContext);

    return (
      <button
        ref={ref}
        className={twMerge(
          active ? 'bg-secondary/10 text-secondary hover:bg-secondary/10' : 'hover:bg-secondary/5',
          'p-2  w-full hover:text-secondary text-left disabled:text-gray-500 cursor-pointer disabled:hover:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          className
        )}
        onClick={(e) => {
          if (onClick) onClick(e);
          if (!disableCloseOnClick) {
            closeDropdown(); // Explicitly close the dropdown after clicking the item
          }
        }}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

export { DropDownContainer, DropDownTrigger, DropDownContent, DropDownItem };
