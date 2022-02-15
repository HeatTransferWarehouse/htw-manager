import React, {useState} from "react";
import { useSelector, useDispatch } from 'react-redux';
import './Main.css'
import MUITable from "mui-datatables";
import Button from "react-bootstrap/Button";
import QueueIcon from "@material-ui/icons/Queue";
import swal from "sweetalert";
import SanmarImporter from '../Importer/SanmarImporter';
import BCClothingImporter from '../Importer/BCClothingImporter';

function Sanmar () {
  
  const SanmarOptions = {
    tableBodyHeight: "600px",
    filter: true,
    filterType: 'multiselect',
  }

  const SanmarItems = useSelector(store => store.item.clothinglist);
  const BcItems = useSelector(store => store.item.bcClothinglist);
  const [host, setHost] = useState('ftp.sanmar.com');
  const [user, setUser] = useState('175733');
  const [password, setPassword] = useState('Sanmar33');
  const dispatch = useDispatch();


async function connectFtp() {
      dispatch({
        type: "CONNECT_FTP",
        payload: {
          host: host,
          user: user,
          password: password,
        }
      });

      setHost('');
      setUser('');
      setPassword('');
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
            <br></br>
            <Button onClick={() => {connectFtp()}}>Download Recent Sanmar Orders</Button>
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