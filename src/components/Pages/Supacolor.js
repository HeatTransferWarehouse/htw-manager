import React, {useState} from "react";
import { useSelector, useDispatch } from 'react-redux';
import "./css/Main.css";
import './css/bootstrap.min.css';
import './css/font-awesome.css';
import './css/flex-slider.css';
import './css/templatemo-softy-pinko.css';
import Button from "react-bootstrap/Button";
import FlagIcon from "@material-ui/icons/Flag";
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';

const robot = require("robotjs");
const dispatch = useDispatch();
const [order, setOrder] = useState('');
const supacolor = useSelector(store => store.item.supacolor);

async function robotAutomation() {

    console.log('Robot triggered: ', supacolor);

    dispatch({
      type: "RESET_SUPACOLOR_ORDER",
    });

    swal('Order Sent!');
  }

switch (supacolor) {
    case []:
      break;
    default:
      robotAutomation();
  }


function Supacolor () {
  
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
    <FormControl component="fieldset">
      <FormLabel component="legend"></FormLabel>
      <TextField value={order} onChange={(e) => {setOrder(e.target.value)}}/>
    </FormControl>
    <Button 
      variant = "contained"
      color = "primary"
      onClick = {
        (event) => {
          event.preventDefault();
          dispatch({
            type: "SUPACOLOR_SUBMIT_ORDER",
            payload: {
              order: order,
            },
          });
      swal(`Submitting Order for ${order}!`);
        }
      }
    ><FlagIcon/> Submit Order</Button>
    </section>
      </>
    )
  }

export default Supacolor;