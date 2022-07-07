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

  const [user, setUser] = React.useState('');
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
      <TextField value={user} onChange={(e) => {setUser(e.target.value)}}/>
    </FormControl>
    <h3>User</h3>
    <FormControl component="fieldset">
      <FormLabel component="legend"></FormLabel>
      <TextField value={channel} onChange={(e) => {setChannel(e.target.value)}}/>
    </FormControl>
    <h3>Channel</h3>
    <Button 
      variant = "contained"
      color = "primary"
      onClick = {
        (event) => {
          event.preventDefault();
          dispatch({
            type: "WALLY_B_HELLO",
            payload: {
                user: user,
                channel: channel,
                message: 1,
            }
          });
      swal("Sending Message..");
        }
      }
    ><FlagIcon/> Hello</Button>
    <Button 
      variant = "contained"
      color = "primary"
      onClick = {
        (event) => {
          event.preventDefault();
          dispatch({
            type: "WALLY_B_HI",
            payload: {
                user: user,
                channel: channel,
                message: 2,
            }
          });
      swal("Sending Message..");
        }
      }
    ><FlagIcon/> Hi</Button>
    <Button 
      variant = "contained"
      color = "primary"
      onClick = {
        (event) => {
          event.preventDefault();
          dispatch({
            type: "WALLY_B_NO",
            payload: {
                user: user,
                channel: channel,
                message: 3,
            }
          });
      swal("Sending Message..");
        }
      }
    ><FlagIcon/> No</Button>
    <Button 
      variant = "contained"
      color = "primary"
      onClick = {
        (event) => {
          event.preventDefault();
          dispatch({
            type: "WALLY_B_YES",
            payload: {
                user: user,
                channel: channel,
                message: 4,
            }
          });
      swal("Sending Message..");
        }
      }
    ><FlagIcon/> Yes</Button>
    <Button 
      variant = "contained"
      color = "primary"
      onClick = {
        (event) => {
          event.preventDefault();
          dispatch({
            type: "WALLY_B_MAYBE",
            payload: {
                user: user,
                channel: channel,
                message: 5,
            }
          });
      swal("Sending Message..");
        }
      }
    ><FlagIcon/> Maybe</Button>
    <Button 
      variant = "contained"
      color = "primary"
      onClick = {
        (event) => {
          event.preventDefault();
          dispatch({
            type: "WALLY_B_KINDA",
            payload: {
                user: user,
                channel: channel,
                message: 6,
            }
          });
      swal("Sending Message..");
        }
      }
    ><FlagIcon/> Kinda</Button>
    <Button 
      variant = "contained"
      color = "primary"
      onClick = {
        (event) => {
          event.preventDefault();
          dispatch({
            type: "WALLY_B_NOT_ROBOT",
            payload: {
                user: user,
                channel: channel,
                message: 7,
            }
          });
      swal("Sending Message..");
        }
      }
    ><FlagIcon/> I am not a Robot</Button>
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
            type: "WALLY_B_CUSTOM",
            payload: {
                user: user,
                message: message,
                channel: channel,
                message: 8,
            }
          });
      swal("Sending Message..");
        }
      }
    ><FlagIcon/> Custom Message</Button>
    </section>
      </>
    )
  }

export default WallyB;