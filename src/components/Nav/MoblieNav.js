import React from "react";
import { HashRouter as Router, NavLink } from "react-router-dom";
import { FaXmark } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import { useDispatch } from "react-redux";

export function MobileNav({
  user,
  home,
  resources,
  decoQueue,
  admin,
  supacolor,
  sffQueue,
  disableAll,
  setHome,
  setResources,
  setDecoQueue,
  setAdmin,
  setSupacolor,
  setSffQueue,
  isOpen,
  setIsOpen,
  toggleMenu,
  clothingQueue,
  setClothingQueue,
}) {
  const dispatch = useDispatch();

  const bgRef = React.useRef(null);

  function handleOutsideClick(e) {
    if (bgRef.current === e.target) {
      setIsOpen(false);
    }
  }

  return (
    <>
      <div
        ref={bgRef}
        onClick={handleOutsideClick}
        className={`fixed top-0 left-0 transition ${
          isOpen
            ? "opacity-100 duration-100"
            : "opacity-0 duration-500 pointer-events-none"
        } bg-black/50 h-screen z-[51] w-full`}>
        <nav
          className={`fixed top-0 left-0 transition-transform duration-200 ease-in-out shadow-2xl overflow-auto bg-white h-screen z-[999999] w-full max-w-[300px] ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
          <button
            id="close-nav"
            aria-label="Close Nav"
            className="absolute top-0 right-0 p-4"
            onClick={toggleMenu}>
            <FaXmark className="w-6 h-6" />
          </button>
          <div className="flex pt-12 flex-col">
            <Router>
              <NavLink
                onClick={() => {
                  setIsOpen(false);
                  disableAll();
                  setHome(true);
                }}
                to="/"
                className={twMerge("p-4", home && "bg-secondary text-white")}>
                Home
              </NavLink>
              <NavLink
                onClick={() => {
                  setIsOpen(false);
                  disableAll();
                  setResources(true);
                }}
                to="/resources"
                className={twMerge(
                  "p-4",
                  resources && "bg-secondary text-white"
                )}>
                Resources
              </NavLink>
              <NavLink
                onClick={() => {
                  setIsOpen(false);
                  disableAll();
                  setSupacolor(true);
                }}
                to="/supacolor"
                className={twMerge(
                  "p-4",
                  supacolor && "bg-secondary text-white"
                )}>
                Supacolor
              </NavLink>
              <NavLink
                onClick={() => {
                  setIsOpen(false);
                  disableAll();
                  setDecoQueue(true);
                }}
                to="/decoqueue"
                className={twMerge(
                  "p-4",
                  decoQueue && "bg-secondary text-white"
                )}>
                DecoQueue
              </NavLink>
              <NavLink
                onClick={() => {
                  setIsOpen(false);
                  disableAll();
                  setSffQueue(true);
                }}
                to="/sff-queue"
                className={twMerge(
                  "p-4",
                  sffQueue && "bg-secondary text-white"
                )}>
                SFF Queue
              </NavLink>
              <NavLink
                onClick={() => {
                  setIsOpen(false);
                  disableAll();
                  setClothingQueue(true);
                }}
                to="/queue/clothing"
                className={twMerge(
                  "p-4",
                  clothingQueue && "bg-secondary text-white"
                )}>
                Clothing Queue
              </NavLink>
              {user.access_level === "5" && (
                <NavLink
                  onClick={() => {
                    setIsOpen(false);
                    disableAll();
                    setAdmin(true);
                  }}
                  to="/admin"
                  className={twMerge(
                    "p-4",
                    admin && "bg-secondary text-white"
                  )}>
                  Admin
                </NavLink>
              )}
              {user.id && (
                <NavLink
                  to="/"
                  onClick={() => {
                    setIsOpen(false);
                    disableAll();
                    dispatch({ type: "LOGOUT" });
                  }}
                  className={twMerge("p-4")}>
                  Log Out
                </NavLink>
              )}
            </Router>
          </div>
        </nav>
      </div>
    </>
  );
}
