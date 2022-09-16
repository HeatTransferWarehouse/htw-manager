import React, { Component, useState } from "react";
import { HashRouter as Router, Link, NavLink } from "react-router-dom";
import Logout from "../LogOutButton/LogOutButton";
import './Nav.css';

function Nav() {

    const [home, setHome] = useState(true);
    const [resources, setResources] = useState(false);
    const [sanMar, setSanMar] = useState(false);
    const [brightPearl, setBrightPearl] = useState(false);
    const [noStock, setNoStock] = useState(false);
    const [affiliates, setAffiliates] = useState(false);
    const [decoQueue, setDecoQueue] = useState(false);
    const [admin, setAdmin] = useState(false);

    const disableAll = () => {
        setHome(false);
        setResources(false);
        setSanMar(false);
        setBrightPearl(false);
        setNoStock(false);
        setAffiliates(false);
        setDecoQueue(false);
        setAdmin(false);
    }

    return (
        <header class="header-area header-sticky">
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <nav class="main-nav">
                            <a class="logo">
                                <img src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/177x60/htwlogo_web_1573140308__59565.original.png" alt="Heat Transfer Warehouse" />
                            </a>
                            <div className="nav">
                                <Router>
                                    {/*HTW logo at top*/}
                                    <div>
                                        <NavLink to="/" onClick={() => { disableAll(); setHome(true) }} className={home ? "active-nav-link" : 'nav-link'}>Home</NavLink>
                                        <NavLink to="/resources" onClick={() => { disableAll(); setResources(true) }} className={resources ? "active-nav-link" : 'nav-link'}>Resources</NavLink>
                                        <NavLink to="/sanmar" onClick={() => { disableAll(); setSanMar(true) }} className={sanMar ? "active-nav-link" : 'nav-link'}>SanMar</NavLink>
                                        <NavLink to="/brightpearl" onClick={() => { disableAll(); setBrightPearl(true) }} className={brightPearl ? "active-nav-link" : 'nav-link'}>Brightpearl</NavLink>
                                        <NavLink to="/nostock" onClick={() => { disableAll(); setNoStock(true) }} className={noStock ? "active-nav-link" : 'nav-link'}>No Stock</NavLink>
                                        <NavLink to="/affiliates" onClick={() => { disableAll(); setAffiliates(true) }} className={affiliates ? "active-nav-link" : 'nav-link'}>Affiliates</NavLink>
                                        <NavLink to="/decoqueue" onClick={() => { disableAll(); setDecoQueue(true) }} className={decoQueue ? "active-nav-link" : 'nav-link'}>DecoQueue</NavLink>
                                        <NavLink to="/admin" onClick={() => { disableAll(); setAdmin(true) }} className={admin ? "active-nav-link" : 'nav-link'}>Admin</NavLink>
                                    </div>
                                </Router>
                            </div>
                            <a class='menu-trigger'>
                                <span>Menu</span>
                            </a>
                        </nav>
                    </div>
                </div>
            </div>
        </header>

    )
}
//grab the count of all of the queues

export default Nav;
