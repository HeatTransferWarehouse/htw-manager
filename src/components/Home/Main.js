import React, {useEffect, useState} from "react";
import { useSelector, useDispatch } from 'react-redux';
import './Main.css'
import MUITable from "../MUITable/MUITable";
import Button from "react-bootstrap/Button";
import { Paper, TextField } from "@material-ui/core";
import Form from "react-bootstrap/Form";
import AssignmentIndIcon from "@material-ui/icons/AssignmentInd";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import Switch from '@material-ui/core/Switch';
import Checkbox from "@material-ui/core/Checkbox";
import DeleteIcon from "@material-ui/icons/Delete";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import FlagIcon from "@material-ui/icons/Flag";
import QueueIcon from "@material-ui/icons/Queue";
import swal from "sweetalert";

function Main () {

  const items = useSelector(store => store.item.itemlist);

  const dispatch = useDispatch();
  const [changeCapture, setChangeCapture] = useState(3);

  const captureOrder = () => {
    dispatch({
      type: "CAPTURE_ORDERS",
      payload: {
        capture: changeCapture
      }
    });

    swal(`Orders in the last ${changeCapture} Minutes Captured on BrightPearl!`);
  }

    //defines the dataselector to know which items to preform actions on
    return (
      <>
      <br></br>
      <br></br>
      <br></br>
      <section className="reseller-form">
      <h2>BrightPearl Order Capture</h2>
      <br></br>
      <h4>Capture Last</h4>
      <input value={changeCapture} type="number" onChange={(e) => (setChangeCapture(e.target.value))} className="order-input"></input>
      <h4>Minutes</h4>
      <br></br>
      <button onClick={(e) => {captureOrder(changeCapture)}} className="order-input">Capture BP Orders</button>
      </section>
      <br/>
      <br/>
      </>
    )
  }

export default Main;
