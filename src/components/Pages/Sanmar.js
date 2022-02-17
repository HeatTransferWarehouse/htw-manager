import React, {useState} from "react";
import { useSelector, useDispatch } from 'react-redux';
import './Main.css'
import MUITable from "mui-datatables";
import Button from "react-bootstrap/Button";
import QueueIcon from "@material-ui/icons/Queue";
import swal from "sweetalert";
import SanmarImporter from '../Importer/SanmarImporter';
import BCClothingImporter from '../Importer/BCClothingImporter';
import * as CSV from 'csv-string';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import TextField from "@material-ui/core/TextField";
import Grid from '@material-ui/core/Grid';

function Sanmar () {
  
  const SanmarOptions = {
    tableBodyHeight: "600px",
    filter: true,
    filterType: 'multiselect',
  }

  const SanmarItems = useSelector(store => store.item.clothinglist);
  const BcItems = useSelector(store => store.item.bcClothinglist);
  const SanmarNotify = useSelector(store => store.item.sanmar);
  const sanmarTracking = useSelector(store => store.item.tracking);
  const [date, setDate] = useState();
  const [host, setHost] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  let sanmarDisplay = <h4></h4>


async function connectFtp() {
    swal('Downloading Info!');
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
      trackingPush.push(pusher);
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
        }
      });
  } else {
    swal('Import some prices first!');
  }
}

  const tracking = sanmarTracking.map((item) => [
    item.order,
    item.tracking,
    item.method,
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
    case 'YES':
      sanmarDisplay = <h4>Download Succesful! Check your downloads folder</h4>
      break;
    case 'NO':
      sanmarDisplay = <h4>Download Failed! File may not be available yet</h4>
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
      <section className="ftp-form">
        <div>
            <h1>SanMar Orders</h1>
            <h4>Host: </h4><input value={host} placeholder="www.example.com" onChange={(e) => {setHost(e.target.value)}}></input>
            <h4>Username: </h4><input value={user} placeholder="1231234" onChange={(e) => {setUser(e.target.value)}}></input>
            <h4>Password: </h4><input value={password} placeholder="super secret" type="password" onChange={(e) => {setPassword(e.target.value)}}></input>
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
                { name: "Shipping Method" }
              ]}
              options={SanmarOptions}
              />
        </div>
      </section>
      <br></br>
      <br></br>
      <section className="sanmar-form">
        <h1>Sync Clothing Prices on BigCommerce</h1>
      </section>
      <section className="sanmar-form">
      <div className="container">
        <div className="row">
        <div className="clothing-importer">
          <h3>Import Clothing Prices from SanMar</h3>
          <SanmarImporter />
        </div>
        <div className="clothing-importer">
          <h3>Import Clothing Prices from BC</h3>
          <BCClothingImporter />
        </div>
        </div>
      <br></br>
      <br></br>
      <div className="row">
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
                { name: "SKU",
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
      <section className="total-form">
      <Button onClick={(e) => {updatePrices()}} className='sales-input'><QueueIcon/> Update Prices</Button>
      </section>
      </>
    )
  }

export default Sanmar;