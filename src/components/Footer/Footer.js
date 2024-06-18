import React, { Component } from "react";

class Footer extends Component {
  // React render function
  render() {
    let thisDate = new Date();
    let thisYear = thisDate.getFullYear();
    const copyright = "\u00A9";
    return (
      <footer className="w-full flex items-center flex-col justify-center bottom-0 h-24 left-0 z-[999999] bg-gradient-to-r from-primary to-secondary">
        <div className="w-full max-w-screen-2xl flex items-center justify-center mx-auto">
          <p className="text-white text-base">
            Copyright {copyright} {thisYear} Heat Transfer Warehouse
          </p>
        </div>
      </footer>
    );
  }
}

export default Footer;
