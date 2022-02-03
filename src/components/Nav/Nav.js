import React, { Component } from "react";
import { HashRouter as Router, Link } from "react-router-dom";
import './Nav.css';

class Nav extends Component {

  render() {
    return (
      <div className="nav">
        <Router>
          {/*HTW logo at top*/}
          <img
            className="nav-logo"
            src="https://cdn11.bigcommerce.com/s-et4qthkygq/images/stencil/177x60/htwlogo_web_1573140308__59565.original.png"
            alt="HTW logo"
          ></img>
          <div>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/sanmar" className="nav-link">SanMar</Link>
              <Link to="/brightpearl" className="nav-link">Brightpearl</Link>
          </div>
          </Router>
      </div>
    )
  }
}
//grab the count of all of the queues

export default Nav;
