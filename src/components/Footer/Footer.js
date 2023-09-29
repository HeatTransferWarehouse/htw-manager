import React, { Component } from "react";
import "./Footer.css";

// This is one of our simplest components
//Simply puts footer on bottom of page
//used for copywrite
class Footer extends Component {
  // React render function
  render() {
    let thisDate = new Date();
    let thisYear = thisDate.getFullYear();
    const copyright = "\u00A9";
    return (
      <footer className="section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <p className="copyright">
                Copyright {copyright} {thisYear} Heat Transfer Warehouse
              </p>
            </div>
          </div>
        </div>
      </footer>
    ); // end return
  } // end render
} // end class Footer

export default Footer;
