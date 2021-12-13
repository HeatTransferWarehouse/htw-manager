import React, { Component } from "react";
import './Footer.css'

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
      <footer className="App-footer">
        <p>
          {copyright}  Heat Transfer Warehouse  {thisYear}
        </p>
      </footer>
    ); // end return
  } // end render
} // end class Footer

export default Footer;
