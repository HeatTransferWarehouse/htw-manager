import React, {useEffect, useState} from "react";
import { useSelector, useDispatch } from 'react-redux';
import './Main.css'
import MUITable from "mui-datatables";
import Button from "react-bootstrap/Button";
import AssignmentIndIcon from "@material-ui/icons/AssignmentInd";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import DeleteIcon from "@material-ui/icons/Delete";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import FlagIcon from "@material-ui/icons/Flag";
import QueueIcon from "@material-ui/icons/Queue";
import swal from "sweetalert";
import Importer from '../Importer/Importer';
import moment from 'moment';

function Main () {

  const options = {
    tableBodyHeight: "600px",
    filter: true,
    filterType: 'multiselect',
    onRowSelectionChange: function (currentRowsSelected, allRowsSelected, rowsSelected) {
      setRows(allRowsSelected);
    }
  }

  useEffect(() => {
    dispatch({
      type: "GET_ITEM_LIST",
    });
  }, [])

  const items = useSelector(store => store.item.itemlist);

  const dispatch = useDispatch();
  const [changeCapture, setChangeCapture] = useState(3);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState([]);

  const captureOrder = () => {
    dispatch({
      type: "CAPTURE_ORDERS",
      payload: {
        capture: changeCapture
      }
    });

    swal(`Orders in the last ${changeCapture} Minutes Captured on BrightPearl!`);
  }

  const deleteData = () => {
    dispatch({
      type: "RESET_DATA",
    });

    swal('Sales Data Reset!');
  }

  const data = items.map((item) => [
    item.name,
    item.sku,
    item.width,
    item.type,
    item.color,
    item.bulk,
    item.sales,
    moment(item.date).format('MMM Do YY'),
  ]);

    const calculateTotal = () => {
      let total = 0;
      for (const row of rows) {
        let index = row.dataIndex;
        let bulkNumber = data[index];
        total += bulkNumber[5];
      }
      setTotal(total);
    }

    //defines the dataselector to know which items to preform actions on
    return (
      <>
      <br></br>
      <br></br>
      <br></br>
      <section className="capture-form">
      <h2>BrightPearl Order Capture</h2>
      <br></br>
      <h4>Capture Last</h4>
      <input value={changeCapture} type="number" onChange={(e) => (setChangeCapture(e.target.value))} className="order-input"></input>
      <h4>Minutes</h4>
      <br></br>
      <Button onClick={(e) => {captureOrder(changeCapture)}} className="sales-input"><PlayArrowIcon/> Capture BP Orders</Button>
      </section>
      <section className="sales-form">
      <section className='reseller-form'>
      <h2>Import Sales Data from BrightPearl</h2>
      <br></br>
      <Importer />
      </section>
      <br></br>
      <section className='total-form'>
      <Button onClick={deleteData} className='sales-input'><DeleteIcon /> Delete Sales Data</Button>
      </section>
      <br></br>
      <br></br>
      <MUITable
              title={"Sales Data"}
              data={data}
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
                { name: "Width" },
                { name: "Type" },
                { name: "Color" },
                { name: "Total Bulk Sales",
                  options: {
                    filter: false,
                  }
                },
                { name: "Total Yardage Sales",
                  options: {
                    filter: false,
                  }
                },
                { name: "Date" },
              ]}
              options={options}
              />
      <br></br>
      <section className='total-form'>
      <h4 className='big-number'>{total}</h4>
      <Button onClick={(e) => {calculateTotal()}} className='sales-input'><QueueIcon/> Calculate Total</Button>
      </section>
      </section>
      </>
    )
  }

export default Main;
