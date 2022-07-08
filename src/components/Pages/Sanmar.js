import React, {useState, useEffect} from "react";
import { useSelector, useDispatch } from 'react-redux';
import './Main.css';
import './css/bootstrap.min.css';
import './css/font-awesome.css';
import './css/templatemo-softy-pinko.css';
import MUITable from "mui-datatables";
import Button from "react-bootstrap/Button";
import QueueIcon from "@material-ui/icons/Queue";
import swal from "sweetalert";
import SanmarImporter from '../Importer/SanmarImporter';
import * as CSV from 'csv-string';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import TextField from "@material-ui/core/TextField";
import Grid from '@material-ui/core/Grid';

function Sanmar () {
  
  const SanmarOptions = {
    tableBodyHeight: "600px",
    filter: true,
    filterType: 'multiselect',
  }

  useEffect(() => {
    dispatch({
      type: "GET_SANMAR_LIST",
    });
  }, [])

  const SanmarItems = useSelector(store => store.item.clothinglist);
  const BcItems = useSelector(store => store.item.bcClothinglist);
  const SanmarNotify = useSelector(store => store.item.sanmar);
  const sanmarTracking = useSelector(store => store.item.tracking);
  const sanmarList = useSelector(store => store.item.sanmarlist);
  const [order, setOrder] = useState();
  const [start, setStart] = useState(0);
  const [date, setDate] = useState();
  const host = 'ftp.sanmar.com';
  const user = '175733';
  const password = 'Sanmar33';
  const dispatch = useDispatch();
  let sanmarDisplay = <h4></h4>


async function connectFtp() {
    swal('Downloading Info!');
    if (host !== 'ftp.sanmar.com' || user !== '175733' || password !== 'Sanmar33') {
      swal('Incorrect Login Info!');
    } else {
      dispatch({
        type: "CONNECT_FTP",
        payload: {
          host: host,
          user: user,
          password: password,
          date: date,
        }
      });
    }
}

async function sendEmail() {
  updateList();
  let found = false;
  const tracking = [];
  for (const item of sanmarTracking) {
    if (item.order === order) {
      found = true;
      tracking.push(item.tracking);
    }
  }
  if (found === true) {
    swal('Sending Email!');
    dispatch({
      type: "SEND_EMAIL",
      payload: {
        order: order,
        tracking: tracking,
      }
    });
  } else {
    swal('Could not find Order! Make sure to download Orders first!');
  }
}

async function download() {
  const arr = CSV.parse(SanmarNotify);
  let trackingPush = [];
  for (const item of arr) {
    if (item[0] === 'CUSTOMER PO') {
    } else {
      let pusher = {
        order: item[0],
        tracking: item[15],
        method: item[17],
      };
      let canPush = true;
      let alreadySent = false;
      for (const p of trackingPush) {
        if (pusher.tracking === p.tracking) {
          canPush = false;
        }
      }
      for (const s of sanmarList) {
        if (pusher.order === s.ref) {
          alreadySent = true;
        }
      }
      if (canPush === true && alreadySent === false) {
      trackingPush.push(pusher);
      }
    }
  }
  dispatch({
    type: "RESET_SANMAR",
  });
  dispatch({
    type: "UPDATE_TRACKING",
    payload: trackingPush,
  });
  swal('Info Downloaded!');
}

const updatePrices = () => {
    if (BcItems[0]) {
      swal('Updating Prices!');
      dispatch({
        type: "UPDATE_PRICES",
        payload: {
          bcItems: BcItems,
          sanmar: SanmarItems,
          start: start,
        }
      });
  } else {
    swal('Import some prices first!');
  }
}

const updateList = (o) => {
  const pusher = [];
  for (const t of sanmarTracking) {
    if (o) {
      if (t.order === order || t.order === o) {
    } else {
      const push = {
        order: t.order,
        tracking: t.tracking,
        method: t.method,
      }
      pusher.push(push);
    }
   } else {
    if (t.order === order) {
    } else {
      const push = {
        order: t.order,
        tracking: t.tracking,
        method: t.method,
      }
      pusher.push(push);
    }
   }
  }
  console.log(pusher);
  dispatch({
    type: "UPDATE_TRACKING",
    payload: pusher,
  });
}

const addSent = (o) => {
  console.log(o);
  let found = false;
  const tracking = [];
  for (const item of sanmarTracking) {
    if (item.order === o) {
      found = true;
      tracking.push(item.tracking);
    }
  }
  if (found === true) {
    swal('Manually marking this order as sent!');
  dispatch({
    type: "ADD_SENT",
    payload: {
      order: o,
      tracking: tracking,
    }
  });
  updateList(o);
  } else {
    swal('Something went wrong! Try again')
  }
}

async function refreshBC() {
  swal('Getting BC Data!');
  dispatch({
    type: "RESET_BC_CLOTHING",
  });
  dispatch({
    type: "REFRESH_BC",
  });
}

async function getSanmar() {
  swal('Getting Sanmar Data!');
  dispatch({
    type: "GET_SANMAR_PRICES",
  });
}

  const tracking = sanmarTracking.map((item) => [
    item.order,
    item.tracking,
    item.method,
  ]);

  const emails = sanmarList.map((item) => [
      item.ref,
      item.tracking,
  ]);

  const sanmarPrices = SanmarItems.map((item) => [
    item.name,
    item.sku,
    item.color,
    item.size,
    item.price,
  ]);

  const bcPrices = BcItems.map((item) => [
    item.name,
    item.sku,
  ]);

  switch (SanmarNotify) {
    case '':
      sanmarDisplay = <h4></h4>
      break;
    case 'WAIT':
      sanmarDisplay = <h4></h4>
      break;
    case 'NO':
      sanmarDisplay = <h4>Download Failed! File may not be available yet</h4>
      break;
    case 'YES':
      download();
      break;
    default:
      download();
  }

    //defines the dataselector to know which items to preform actions on
    return (
      <>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <section id="sanmar-nav" className="container">
        <div className="row">
          <h1>SanMar Orders</h1>
        </div>
        <div className="row">
          <div>
            <br />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container justify="space-around">
                <DesktopDatePicker
                label="Date"
                value={date}
                minDate={new Date('2009-01-01')}
                onChange={(newValue) => {
                setDate(newValue);
                }}
                renderInput={(params) => <TextField {...params} />}
                />
                </Grid>
            </LocalizationProvider>
            <br />
            <Button onClick={() => {connectFtp()}}>Download Recent Sanmar Orders</Button>
          </div>
          <br />
          <div>
          {sanmarDisplay}
          </div>
        </div>
        <br/>
        <div className="row">
          <br/>
          <h4>Order #: </h4><input value={order} placeholder="3201122" onChange={(e) => {setOrder(e.target.value)}}></input>
         <div>
          <Button onClick={() => {sendEmail()}}>Send Email</Button>
         </div>
        </div>
        </section>
        <div className="tracking-data">
            <MUITable
              title={"Sanmar Tracking"}
              data={tracking}
              columns={[
                //names the columns found on MUI table
                { name: "Order #",
                  options: { 
                    filter: false,
                  }
                },
                { name: "Tracking #",
                  options: {
                    filter: false,
                  }
                },
                { name: "Shipping Method" },
                {
                  name: "",
                  options: {
                    filter: false,
                    sort: false,
                    empty: true,
                    customBodyRenderLite: (dataIndex, rowIndex) => {
                      return (
                        <Button
                          variant="contained"
                          onClick = {() => {
                            const o = tracking[dataIndex][0];
                            addSent(o);
                          }
                        }
                        >
                        Mark Sent
                        </Button>
                      );
                    },
                  },
                },
              ]}
              options={SanmarOptions}
              />
        </div>
        <div className="tracking-data">
            <MUITable
              title={"Sent Emails"}
              data={emails}
              columns={[
                //names the columns found on MUI table
                { name: "Order #",
                  options: { 
                    filter: false,
                  }
                },
                { name: "Tracking #",
                  options: {
                    filter: false,
                  }
                },
              ]}
              options={SanmarOptions}
              />
        </div>
      <br></br>
      <br></br>
      <section className="sanmar-form">
        <h1>Sync Clothing Prices on BigCommerce</h1>
      </section>
      <section className="sanmar-form">
      <div className="container">
      <div className="sanmar-row">
        <div className="clothing-data">
          <SanmarImporter />
          {/* <Button onClick={(e) => {refreshSanmar()}}>Refresh SanMar Prices</Button> */}
        </div>
        <div className="total-form">
          <Button onClick={(e) => {refreshBC()}} className='sales-input'>Get BC Prices</Button>
        </div>
        <div className="total-form">
          <Button onClick={(e) => {getSanmar()}} className='sales-input'>Get SanMar Prices</Button>
        </div>
        <div className="total-form">
          <h4>ID Start: </h4><input value={start} placeholder="0" onChange={(e) => {setStart(e.target.value)}}></input>
        </div>
        <div className="total-form">
          <Button onClick={(e) => {updatePrices()}} className='sales-input'><QueueIcon/> Update Prices</Button>
        </div>
      </div>
      <br></br>
      <br></br>
      <div className="sanmar-row">
        <div className="clothing-data">
            <MUITable
              title={"SanMar Prices"}
              data={sanmarPrices}
              columns={[
                //names the columns found on MUI table
                { name: "Name",
                  options: { 
                    filter: false,
                  }
                },
                { name: "SKU",
                  options: {
                    filter: false,
                  }
                },
                { name: "Color" },
                { name: "Size" },
                { name: "Price" }
              ]}
              options={SanmarOptions}
              />
        </div>
        <div className="clothing-data">
            <MUITable
              title={"BC Prices"}
              data={bcPrices}
              columns={[
                //names the columns found on MUI table
                { name: "Name",
                  options: { 
                    filter: false,
                  }
                },
                { name: "ID",
                  options: {
                    filter: false,
                  }
                }
              ]}
              options={SanmarOptions}
              />
        </div>
      </div>
      </div>
      </section>
      </>
    )
  }

export default Sanmar;