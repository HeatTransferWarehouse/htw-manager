import React, { Component } from "react";
import { HashRouter as Router, Link, NavLink } from "react-router-dom";
import Logout from "../LogOutButton/LogOutButton";
import './Nav.css';

class Nav extends Component {
    
    render() {
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
                                            <NavLink to="/" className="nav-link">Home</NavLink>
                                            <NavLink to="/resources" className="nav-link">Resources</NavLink>
                                            <NavLink to="/sanmar" className="nav-link">SanMar</NavLink>
                                            <NavLink to="/brightpearl" className="nav-link">Brightpearl</NavLink>
                                            <NavLink to="/nostock" className="nav-link">No Stock</NavLink>
                                            <NavLink to="/affiliates" className="nav-link">Affiliates</NavLink>
                                            <NavLink to="/decoqueue" className="nav-link">DecoQueue</NavLink>
                                            <NavLink to="/admin" className="nav-link">Admin</NavLink>
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
}
//grab the count of all of the queues

export default Nav;
