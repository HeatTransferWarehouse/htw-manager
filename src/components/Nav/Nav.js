import React, { useContext, useEffect, useState } from "react";
import { HashRouter as Router, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MobileNav } from "./MoblieNav";
import { RxHamburgerMenu } from "react-icons/rx";
import { BreakpointsContext } from "../../context/BreakpointsContext";

function Nav() {
  const breakPoint = useContext(BreakpointsContext);

  const [home, setHome] = useState(false);
  const [resources, setResources] = useState(false);
  const [decoQueue, setDecoQueue] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [supacolor, setSupacolor] = useState(false);
  const [sffQueue, setSffQueue] = useState(false);
  const [clothingQueue, setClothingQueue] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user.userReducer);
  const [pagePath, setPagePath] = useState(window.location.hash.split("#")[1]);

  if (pagePath.includes("?")) {
    setPagePath(pagePath.split("?")[0]);
  }

  const [isOpen, setIsOpen] = useState(false);

  // Function to handle the menu toggle
  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const mainContainer = document.getElementsByClassName("main-container")[0];
    if (mainContainer) {
      if (isOpen) {
        mainContainer.classList.add("no-pointer-events");
      } else {
        mainContainer.classList.remove("no-pointer-events");
      }
    }
  }, [isOpen]);

  useEffect(() => {
    switch (pagePath) {
      case "/":
        disableAll();
        setHome(true);
        break;
      case "/resources":
        disableAll();
        setResources(true);
        break;
      case "/decoqueue":
        disableAll();
        setDecoQueue(true);
        break;
      case "/admin":
        disableAll();
        setAdmin(true);
        break;
      case "/supacolor":
        disableAll();
        setSupacolor(true);
        break;
      case "/sff-queue":
        disableAll();
        setSffQueue(true);
        break;
      case "/queue/clothing":
        disableAll();
        setClothingQueue(true);
        break;
      default:
        break;
    }
  }, [pagePath]);

  // This unactivates all nav destinations
  const disableAll = () => {
    setHome(false);
    setResources(false);
    setDecoQueue(false);
    setAdmin(false);
    setSupacolor(false);
    setSffQueue(false);
    setClothingQueue(false);
  };

  useEffect(() => {
    dispatch({ type: "FETCH_USER" });
  }, [dispatch]);

  const props = {
    user: user,
    home: home,
    resources: resources,
    decoQueue: decoQueue,
    admin: admin,
    supacolor: supacolor,
    sffQueue: sffQueue,
    disableAll: disableAll,
    setHome: setHome,
    setResources: setResources,
    setDecoQueue: setDecoQueue,
    setAdmin: setAdmin,
    setSupacolor: setSupacolor,
    setSffQueue: setSffQueue,
    isOpen: isOpen,
    setIsOpen: setIsOpen,
    toggleMenu: toggleMenu,
    clothingQueue: clothingQueue,
    setClothingQueue: setClothingQueue,
  };

  const renderNav = () => {
    if (breakPoint === "tablet") {
      return <MobileNav {...props} />;
    } else if (breakPoint === "mobile") {
      return <MobileNav {...props} />;
    }
    return null;
  };

  return (
    <>
      <header className="bg-white relative w-full h-[86px] z-50 py-4 px-8 flex items-center justify-center shadow-default">
        <div className="w-full max-lg:hidden max-w-screen-2xl flex items-center justify-between">
          <a href="https://www.heattransferwarehouse.com/">
            <img
              className="w-[125px] h-[auto]"
              src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/original/image-manager/heat-transfer-warehouse-logo-2024.png?t=1710348082"
              alt="Heat Transfer Warehouse Logo"
            />
          </a>
          <nav className="flex gap-4 items-center">
            <Router>
              <NavLink
                to="/"
                onClick={() => {
                  disableAll();
                  setHome(true);
                }}
                className={`${
                  home
                    ? "text-secondary border-secondary"
                    : "text-dark border-white"
                } p-2 hover:border-secondary hover:text-secondary border-b-[3px] border-solid`}>
                Home
              </NavLink>
              <NavLink
                to="/resources"
                onClick={() => {
                  disableAll();
                  setResources(true);
                }}
                className={`${
                  resources
                    ? "text-secondary border-secondary"
                    : "text-dark border-white"
                } p-2 hover:border-secondary hover:text-secondary border-b-[3px] border-solid`}>
                Resources
              </NavLink>
              <NavLink
                to="/supacolor"
                onClick={() => {
                  disableAll();
                  setSupacolor(true);
                }}
                className={`${
                  supacolor
                    ? "text-secondary border-secondary"
                    : "text-dark border-white"
                } p-2 hover:border-secondary hover:text-secondary border-b-[3px] border-solid`}>
                Supacolor
              </NavLink>
              <NavLink
                to="/decoqueue"
                onClick={() => {
                  disableAll();
                  setDecoQueue(true);
                }}
                className={`${
                  decoQueue
                    ? "text-secondary border-secondary"
                    : "text-dark border-white"
                } p-2 hover:border-secondary hover:text-secondary border-b-[3px] border-solid`}>
                DecoQueue
              </NavLink>
              <NavLink
                to="/sff-queue"
                onClick={() => {
                  disableAll();
                  setSffQueue(true);
                }}
                className={`${
                  sffQueue
                    ? "text-secondary border-secondary"
                    : "text-dark border-white"
                } p-2 hover:border-secondary hover:text-secondary border-b-[3px] border-solid`}>
                SFF Queue
              </NavLink>
              <NavLink
                to="/queue/clothing"
                onClick={() => {
                  disableAll();
                  setClothingQueue(true);
                }}
                className={`${
                  clothingQueue
                    ? "text-secondary border-secondary"
                    : "text-dark border-white"
                } p-2 hover:border-secondary hover:text-secondary border-b-[3px] border-solid`}>
                Clothing Queue
              </NavLink>
              {user.access_level === "5" && (
                <NavLink
                  to="/admin"
                  onClick={() => {
                    disableAll();
                    setAdmin(true);
                  }}
                  className={`${
                    admin
                      ? "text-secondary border-secondary"
                      : "text-dark border-white"
                  } p-2 hover:border-secondary hover:text-secondary border-b-[3px] border-solid`}>
                  Admin
                </NavLink>
              )}
            </Router>
          </nav>
          <div>
            <Router>
              {user.id && (
                <NavLink
                  to="/"
                  onClick={() => {
                    dispatch({ type: "LOGOUT" });
                  }}
                  className="p-2 hover:text-secondary">
                  Log Out
                </NavLink>
              )}
            </Router>
          </div>
        </div>
        <div className="lg:hidden w-full flex items-center justify-between">
          <a href="https://www.heattransferwarehouse.com/">
            <img
              className="w-[100px] h-[auto]"
              src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/original/image-manager/heat-transfer-warehouse-logo-2024.png?t=1710348082"
              alt="Heat Transfer Warehouse Logo"
            />
          </a>
          <button id="open-nav" aria-label="Open Nav" onClick={toggleMenu}>
            <RxHamburgerMenu className="w-6 h-6" />
          </button>
        </div>
      </header>
      {renderNav()}
    </>
  );
}
//grab the count of all of the queues

export default Nav;
