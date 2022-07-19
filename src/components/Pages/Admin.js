import React from "react";
import "./css/Main.css";
import './css/bootstrap.min.css';
import './css/font-awesome.css';
import './css/flex-slider.css';
import './css/templatemo-softy-pinko.css';
import Button from "react-bootstrap/Button";
import FlagIcon from "@material-ui/icons/Flag";


function WallyB () {
  
    return (
      <>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
    <section className="nav">
    <Button 
      variant = "contained"
      color = "primary"
      href="/#/wallyb"
    ><FlagIcon/> Wally B</Button>
    <Button 
      variant = "contained"
      color = "primary"
      href="/#/register"
    ><FlagIcon/> New User</Button>
    </section>
      </>
    )
  }

export default WallyB;