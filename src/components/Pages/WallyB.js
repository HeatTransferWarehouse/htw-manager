import React from "react";
import { useDispatch } from 'react-redux';
import './Main.css'
import Button from "react-bootstrap/Button";
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import QueueIcon from "@material-ui/icons/Queue";
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
    <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Channel</InputLabel>
          <Select
          className="dead-inventory"
          value={reason}
          label="Channel"
          onChange={(e) => {setChannel(e)}}
          >
            <MenuItem value={'C0139RJPUEM'}>#osiaffiliate</MenuItem>
            <MenuItem value={'C0J6SU483'}>#social-htw</MenuItem>
            <MenuItem value={'C01CBRYK57V'}>#darkweb</MenuItem>
            <MenuItem value={'C02EV4JKSLA'}>#no-stock-notify</MenuItem>
            <MenuItem value={'C0JBP7GBS'}>#htw-news-update</MenuItem>
          </Select>
        </FormControl>
    </Box>
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
    ><QueueIcon/> Send Message</Button>
    </section>
      </>
    )
  }

export default WallyB;