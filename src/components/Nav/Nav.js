import React, { useState } from "react";
import { HashRouter as Router, NavLink } from "react-router-dom";
import "./Nav.css";

function Nav() {
  // State for the nav links. When true, they will be black. When false they will be light gray.
  // Home is true by default.
  const [home, setHome] = useState(true);
  const [resources, setResources] = useState(false);
  const [sanMar, setSanMar] = useState(false);
  const [brightPearl, setBrightPearl] = useState(false);
  const [decoQueue, setDecoQueue] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [supacolor, setSupacolor] = useState(false);

  // This unactivates all nav destinations
  const disableAll = () => {
    setHome(false);
    setResources(false);
    setSanMar(false);
    setBrightPearl(false);
    setDecoQueue(false);
    setAdmin(false);
    setSupacolor(false);
  };

  return (
    <header className="header-area header-sticky">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <nav className="main-nav">
              <a className="logo" href="https://www.heattransferwarehouse.com/">
                <img
                  src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/original/image-manager/htw-2022logo-tm.png?t=1675694884&_gl=1*tqn07u*_ga*MTk4MTk0MDU2My4xNjc1Mzc0MDgz*_ga_WS2VZYPC6G*MTY3NTY5MjY2Mi4xMC4xLjE2NzU2OTQ4NzIuNDAuMC4w"
                  alt="Heat Transfer Warehouse"
                />
              </a>
              <div className="nav">
                <Router>
                  {/*HTW logo at top*/}
                  <div>
                    <NavLink
                      to="/"
                      onClick={() => {
                        disableAll();
                        setHome(true);
                      }}
                      className={home ? "active-nav-link" : "nav-link"}>
                      Home
                    </NavLink>
                    <NavLink
                      to="/resources"
                      onClick={() => {
                        disableAll();
                        setResources(true);
                      }}
                      className={resources ? "active-nav-link" : "nav-link"}>
                      Resources
                    </NavLink>
                    <NavLink
                      to="/supacolor"
                      onClick={() => {
                        disableAll();
                        setSupacolor(true);
                      }}
                      className={supacolor ? "active-nav-link" : "nav-link"}>
                      Supacolor
                    </NavLink>
                    <NavLink
                      to="/sanmar"
                      onClick={() => {
                        disableAll();
                        setSanMar(true);
                      }}
                      className={sanMar ? "active-nav-link" : "nav-link"}>
                      SanMar
                    </NavLink>
                    {/* <NavLink
                      to="/brightpearl"
                      onClick={() => {
                        disableAll();
                        setBrightPearl(true);
                      }}
                      className={brightPearl ? "active-nav-link" : "nav-link"}>
                      Brightpearl
                    </NavLink> */}
                    {/* <NavLink
                      to="/nostock"
                      onClick={() => {
                        disableAll();
                        setNoStock(true);
                      }}
                      className={noStock ? "active-nav-link" : "nav-link"}>
                      No Stock
                    </NavLink> */}
                    {/* <NavLink
                      to="/affiliates"
                      onClick={() => {
                        disableAll();
                        setAffiliates(true);
                      }}
                      className={affiliates ? "active-nav-link" : "nav-link"}>
                      Affiliates
                    </NavLink> */}
                    <NavLink
                      to="/decoqueue"
                      onClick={() => {
                        disableAll();
                        setDecoQueue(true);
                      }}
                      className={decoQueue ? "active-nav-link" : "nav-link"}>
                      DecoQueue
                    </NavLink>
                    <NavLink
                      to="/admin"
                      onClick={() => {
                        disableAll();
                        setAdmin(true);
                      }}
                      className={admin ? "active-nav-link" : "nav-link"}>
                      Admin
                    </NavLink>
                  </div>
                </Router>
              </div>
              <a
                className="menu-trigger"
                href="https://www.heattransferwarehouse.com/">
                <span>Menu</span>
              </a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
//grab the count of all of the queues

export default Nav;
