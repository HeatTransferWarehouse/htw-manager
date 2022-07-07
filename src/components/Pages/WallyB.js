import React from "react";
import { useDispatch } from 'react-redux';
import './Main.css'
import Button from "react-bootstrap/Button";
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FlagIcon from "@material-ui/icons/Flag";
import TextField from '@material-ui/core/TextField';
import swal from "sweetalert";


function WallyB () {

  const [channel, setChannel] = React.useState('C0139RJPUEM');
  const [message, setMessage] = React.useState('');
  const dispatch = useDispatch();
  
    return (
      <>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
    <section className="nav">
    <FormControl component="fieldset">
      <FormLabel component="legend"></FormLabel>
      <TextField value={channel} onChange={(e) => {setChannel(e.target.value)}}/>
    </FormControl>
    <h3>Channel</h3>
    <FormControl component="fieldset">
      <FormLabel component="legend"></FormLabel>
      <TextField value={message} onChange={(e) => {setMessage(e.target.value)}}/>
    </FormControl>
    <Button 
      variant = "contained"
      color = "primary"
      onClick = {
        (event) => {
          event.preventDefault();
          dispatch({
            type: "WALLY_B_MESSAGE",
            payload: {
                message: message,
                channel: channel,
            }
          });
      swal("Sending Message..");
        }
      }
    ><FlagIcon/> Send Message</Button>
    </section>
      </>
    )
  }

export default WallyB;