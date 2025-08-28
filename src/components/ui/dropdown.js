import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      const trigger = triggerRef.current;
      const content = contentRef.current;
      if (
        trigger &&
        !trigger.contains(event.target) &&
        content &&
        !content.contains(event.target)
      ) {
        if (isOpen) {
          closeDropdown();
          onClose && onClose(event);
        }
      }
    };

    if (type !== 'hover') {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      if (type !== 'hover') {
        document.removeEventListener('click', handleClickOutside);
      }
    };
  }, [type, isOpen, onClose, triggerRef, contentRef]);

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

const DropDownTrigger = forwardRef(({ children, className, onClick, ...props }) => {
  const { isOpen, toggleOpen, type, triggerRef } = useContext(DropDownContext);

  return (
    <button
      ref={triggerRef}
      className={twMerge(
        isOpen ? 'bg-secondary/10' : '',
        'cursor-pointer group p-2 rounded-md transition hover:text-secondary flex items-center justify-start gap-4',
        className
      )}
      onClick={(e) => {
        onClick && onClick(e);
        if (type !== 'hover') toggleOpen();
      }}
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
  const { isOpen, dropdownstyle, containerRef, contentRef } = useContext(DropDownContext);
  const [isPositioned, setIsPositioned] = useState(false);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      const { offsetWidth, scrollHeight } = contentRef.current;
      const { buttonWidth, positionX, positionY, triggerHeight } = dropdownstyle;

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let top = triggerHeight + 4;
      let left = 0;
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
        width:
          buttonWidth < contentRef.current?.scrollWidth
            ? contentRef.current?.scrollWidth
            : buttonWidth,
        left: isRight ? 'unset' : left,
        right: isRight ? viewportWidth - positionX - buttonWidth : 'unset',
        top: isBottom ? 'unset' : top,
        bottom: isBottom ? viewportHeight - positionY + 4 : 'unset',
      });
    }
  }, [isOpen, dropdownstyle, children, contentRef]);

  return isOpen && containerRef.current
    ? createPortal(
        <div
          ref={contentRef}
          className={twMerge(
            'absolute z-[999999] rounded-md h-fit max-h-[200px] min-w-[120px] overflow-x-hidden overflow-y-auto bg-white shadow-default',
            className
          )}
          style={{
            ...style,
            ...isPositioned,
          }}
        >
          {children}
        </div>,
        containerRef.current
      )
    : null;
};

const DropDownItem = forwardRef(({ children, className, onClick, active, ...rest }, ref) => {
  const { closeDropdown } = useContext(DropDownContext);

  return (
    <div
      ref={ref}
      className={twMerge(
        active ? 'bg-secondary/10 text-secondary' : '',
        'p-2 hover:bg-secondary/10 hover:text-secondary cursor-pointer',
        className
      )}
      onClick={(e) => {
        if (onClick) onClick(e);
        closeDropdown(); // Explicitly close the dropdown after clicking the item
      }}
      {...rest}
    >
      {children}
    </div>
  );
});

export { DropDownContainer, DropDownTrigger, DropDownContent, DropDownItem };
