import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { FaCaretDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

const Pagination = ({ children, id, props }) => {
  const { itemsCount, rowsPerPage, page, setRowsPerPage, setPage } = props;

  const triggerRef = useRef(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [renderContent, setRenderContent] = useState(false);
  const [positionx, setPositionx] = useState(0);
  const [positiony, setPositiony] = useState(0);
  const [triggerHeight, setTriggerHeight] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [nextIsDisabled, setNextIsDisabled] = useState(false);
  const [buttonWidth, setButtonWidth] = useState(0);

  useEffect(() => {
    setNextIsDisabled(itemsCount <= rowsPerPage * (page + 1));
  }, [rowsPerPage, page, itemsCount]);

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    setButtonWidth(rect.width);
    setPositionx(rect.x);
    setPositiony(rect.y);
    setTriggerHeight(rect.height);
  };

  useEffect(() => {
    const mainContainer = document.querySelector('.main-container');
    if (!mainContainer) return;

    const handleScrollResize = () => {
      calculatePosition();
    };

    mainContainer.addEventListener('scroll', handleScrollResize);
    window.addEventListener('resize', handleScrollResize); // Attach resize to the window

    calculatePosition(); // Initial calculation

    return () => {
      mainContainer.removeEventListener('scroll', handleScrollResize);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, []);

  useEffect(() => {
    if (internalOpen) {
      calculatePosition(); // Recalculate position when opening the sheet
      setRenderContent(true);
      setTimeout(() => setMounted(true), 50);
    } else {
      setMounted(false);
      const timer = setTimeout(() => setRenderContent(false), 300);
      return () => clearTimeout(timer);
    }
  }, [internalOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target)) {
        setInternalOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [id]);

  return (
    <div className={twMerge('px-1 py-2 flex justify-end items-center grow gap-2')}>
      <div className="flex items-center relative gap-6">
        {React.Children.map(children, (child) => {
          if (child.type === PaginationTrigger) {
            return React.cloneElement(child, {
              ref: triggerRef,
              setOpen: setInternalOpen,
              isOpen: internalOpen,
              renderContent,
              mounted,
              nextIsDisabled,
              setNextIsDisabled,
              buttonWidth,
              setRowsPerPage,
              setPage,
              itemsCount,
              positionx,
              positiony,
              triggerHeight,
              rowsPerPage,
              page,
            });
          } else {
            return React.cloneElement(child, {
              setOpen: setInternalOpen,
              isOpen: internalOpen,
              renderContent,
              mounted,
              nextIsDisabled,
              setNextIsDisabled,
              buttonWidth,
              setRowsPerPage,
              setPage,
              itemsCount,
              positionx,
              positiony,
              triggerHeight,
              rowsPerPage,
              page,
              calculatePosition,
            });
          }
        })}
      </div>
    </div>
  );
};

const PaginationTrigger = forwardRef(({ isOpen, setOpen, rowsPerPage, page, itemsCount }, ref) => {
  const getPaginationRange = () => {
    const start = page === 0 ? 1 : page * rowsPerPage + 1;
    const end = Math.min(rowsPerPage * (page + 1), itemsCount);
    return `${start} - ${end}`;
  };

  return (
    <button
      className={twMerge(
        'rounded-md flex gap-1 items-center hover:bg-secondary/10 group/rows hover:text-secondary p-2 transition duration-200',
        isOpen && 'bg-secondary/10 text-secondary'
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(!isOpen);
      }}
      ref={ref}
    >
      <p>{getPaginationRange()}</p>
      <p>of</p>
      <p>{itemsCount}</p>
      <FaCaretDown className="w-3 h-3 ml-2" />
    </button>
  );
});

const PaginationSheet = ({
  className,
  children,
  renderContent,
  mounted,
  setRowsPerPage,
  setOpen,
  buttonWidth,
  setPage,
  positionx,
  positiony,
  triggerHeight,
  rowsPerPage,
  sheetPosition,
}) => {
  const childrenHeight = 40;
  const sheetHeight = children.length * childrenHeight;

  const style = {
    width: buttonWidth,
    height: mounted ? `${sheetHeight}px` : 0,
    left: positionx,
    top: sheetPosition === 'top' ? positiony + triggerHeight + 4 : 'unset',
    bottom:
      sheetPosition === 'bottom'
        ? window.outerHeight - positiony + triggerHeight + 4 - sheetHeight
        : 'unset',
    transition: 'height 150ms',
  };

  return renderContent
    ? createPortal(
        <div
          className={twMerge(
            className,
            mounted ? 'shadow-default' : '',
            'absolute z-[999999] rounded-md overflow-hidden bg-white'
          )}
          style={style}
        >
          <ul className="list-none w-full m-0 p-0">
            {React.Children.map(children, (child) => {
              return React.cloneElement(child, {
                setOpen,
                setPage,
                setRowsPerPage,
                rowsPerPage,
              });
            })}
          </ul>
        </div>,
        document.body
      )
    : null;
};

const PaginationOption = ({
  className,
  children,
  rowsPerPage,
  setRowsPerPage,
  setPage,
  value,
  setOpen,
}) => {
  return (
    <li
      className={twMerge(
        className,
        value === rowsPerPage ? 'bg-secondary/10 text-secondary' : '',
        'cursor-pointer py-2 px-3 hover:text-secondary hover:bg-secondary/10'
      )}
      onClick={() => {
        setRowsPerPage(value);
        setPage(0);
        setOpen(false);
      }}
    >
      {children}
    </li>
  );
};

const PaginationControls = ({ setPage, page, nextIsDisabled }) => {
  return (
    <div className="flex items-center gap-1">
      <button
        aria-label="Previous Page"
        className={twMerge(
          'p-3 rounded-full flex items-center justify-center transition duration-200 ',
          page === 0 ? 'cursor-not-allowed' : 'hover:bg-secondary/10 group/pag-next'
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPage(page - 1);
        }}
        disabled={page === 0}
      >
        <FaChevronLeft
          className={twMerge(
            'w-4 h-4 relative right-[1px] transition duration-200 ',
            page === 0 ? 'fill-gray-400' : 'group-hover/pag-next:fill-secondary'
          )}
        />
      </button>
      <button
        aria-label="Next Page"
        className={twMerge(
          'p-3 rounded-full transition duration-200 ',
          !nextIsDisabled
            ? 'cursor-pointer hover:bg-secondary/10 group/pag-next'
            : 'cursor-not-allowed'
        )}
        disabled={nextIsDisabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPage(page + 1);
        }}
      >
        <FaChevronRight
          className={twMerge(
            'w-4 h-4 relative left-[1px] transition duration-200 ',
            nextIsDisabled ? 'fill-gray-400' : 'group-hover/pag-next:fill-secondary'
          )}
        />
      </button>
    </div>
  );
};

export { Pagination, PaginationTrigger, PaginationSheet, PaginationOption, PaginationControls };
