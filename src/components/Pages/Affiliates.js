import React, {useEffect, useState} from "react";
import { useSelector, useDispatch } from 'react-redux';
import "./Main.css";
import MUITable from "mui-datatables";
import Grid from '@material-ui/core/Grid';
import TextField from "@material-ui/core/TextField";
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import Form from "react-bootstrap/Form";
import moment from "moment";
import { Button } from "@material-ui/core";

function Affilates () {

  const dispatch = useDispatch();

  const topfive = useSelector(store => store.affiliate.topfive);
  const skunumlist = useSelector(store => store.affiliate.skunumlist);
  const itemlist = useSelector(store => store.affiliate.itemlist);
  const emaillist = useSelector(store => store.affiliate.emaillist);
  const totallist = useSelector(store => store.affiliate.totallist);

  const [email, setEmail] = useState('');
  const [startDate, setStartDate] = useState({});
  const [endDate, setEndDate] = useState('');

useEffect(() => {
    //dispatch({
   //   type: "GET_TOP_FIVE",
   // });
   // dispatch({
  //    type: "GET_AFFILIATE_LIST",
  //  });
  //  dispatch({
  //    type: "GET_EMAIL_LIST",
  //  });
   // dispatch({
  //    type: "GET_TOTAL_LIST",
   // });
  //  dispatch({
   //   type: "DELETE_ITEM_RANGE",
  //  });
  //  dispatch({
  //    type: "DELETE_SKU_RANGE",
  //  });
}, [])

const checkEmail = (event) => {
    //prevents default action
    event.preventDefault();
    dispatch({
      type: "CHECK_EMAIL",
      payload: {
        email: email,
        startDate: startDate,
        endDate: endDate,
      },
    });
};

const data = itemlist.map((item) => [
      item.email,
      item.order_number,
      Number(item.order_total).toFixed(2),
      item.qty,
      moment(item.created_at).add(6, "hours").format("MMM Do YY"),
]);

const topdata = topfive.map((item) => [
  item.email,
  item.count
]);

const totaldata = totallist.map((total) => [
  total.email,
  total.count,
]);

const skunumdata = skunumlist.map((skunum) => [
  skunum.sku, 
  skunum.description, 
  skunum.count
]);


return (
      <>
        <div>
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <div style={{ padding: "1.5%" }}>
            <h1 style={{ textAlign: "center" }}>
              Top 5 Affilates within the last 30 days
            </h1>
            <MUITable
              data={topdata} //brings in data as an array, in this case, list of items
              options= {{
                filter: true,
                filterType: "dropdown",
                responsive: "vertical",
                tableBodyHeight: "600px",
                tableBodyMaxHeight: " ",
                rowsPerPage: 2000,
                rowsPerPageOptions: [2000],
                selectableRows: false, //false means checkboxes are hidden
              }}
              columns={[
                //names the columns found on MUI table
                { name: "Affiliate Email" },
                { name: "Total items sold" },
              ]}
              title={"Top 5 Affilates within the last 30 days"} //give the table a name
            />
          </div>
          <div style={{ padding: "1.5%" }}>
            <h1 style={{ textAlign: "center" }}>Affiliate Order History</h1>
            <MUITable
              data={data} //brings in data as an array, in this case, list of items
              columns={[
                //names the columns found on MUI table
                { name: "Affiliate Email" },
                { name: "Order Number" },
                { name: "Order Total" },
                { name: "Number of items sold" },
                { name: "Date of Sale" },
              ]}
              title={"Record of Sales"} //give the table a name
            />
          </div>
          <br />
          <br />
          <div style={{ padding: "1.5%" }}>
            <h1 style={{ textAlign: "center" }}>
              Total Items Sold
            </h1>
            <MUITable
              data={totaldata} //brings in data as an array, in this case, list of items
              columns={[
                //names the columns found on MUI table
                { name: "Affiliate Email" },
                { name: "Total items sold" },
              ]}
              title={"All items sold per affiliate"} //give the table a name
            />
          </div>
          <br />
          <br />
          <br />
          <div style={{ padding: "1.5%" }}>
            <center>
              <>
                <h1>Select a Date Range</h1>
                <MuiPickersUtilsProvider utils={LuxonUtils}>
                  <Grid container justify="space-around">
                  {/* used to filter by date */}
                  <DatePicker
                  label="Start Date"
                  inputFormat="MM/dd/yyyy"
                  value={`${startDate.year}-${startDate.month}-${startDate.day}`}
                  onChange={(event) =>
                    setStartDate({startDate: {year: event.c.year, month: event.c.month, day: event.c.day}})
                  }
                  renderInput={(params) => <TextField {...params} />}
                  />
                  </Grid>
                </MuiPickersUtilsProvider>
                <MuiPickersUtilsProvider utils={LuxonUtils}>
                  <Grid container justify="space-around">
                  <DatePicker
                  label="End Date"
                  inputFormat="MM/dd/yyyy"
                  value={`${endDate.year}-${endDate.month}-${endDate.day}`}
                  onChange={(event) =>
                    setEndDate({endDate: {year: event.c.year, month: event.c.month, day: event.c.day}})
                  }
                  renderInput={(params) => <TextField {...params} />}
                  />
                  </Grid>
                </MuiPickersUtilsProvider>
              </>
              {startDate === null || endDate === null ? (
                <span></span>
              ) : startDate > endDate ? (
                <h1>Start Date can't be after the End Date</h1>
              ) : (
                <>
                  <h1>Select an Affiliate</h1>
                  <Form.Control
                    as="select"
                    onChange={(event) =>
                      setEmail(`${event.target.value}`)
                    }
                  >
                    <option value="">Pick From Below </option>{" "}
                    {emaillist
                      ? emaillist.map((item) => (
                          <option key={item.id} value={item.id}>
                            {" "}
                            {String(item.email)}{" "}
                          </option>
                        ))
                      : ""}
                  </Form.Control>
                  <Form>
                    <center>
                      <Button
                        onClick={(event) => checkEmail(event)}
                        variant="contained"
                        color="primary"
                        type="submit"
                        style={{ width: "20%", margin: "2%" }}
                      >
                        Confirm Affiliate
                      </Button>
                    </center>
                  </Form>
                </>
              )}
            </center>
            <MUITable
              data={skunumdata} //brings in data as an array, in this case, list of items
              columns={[
                //names the columns found on MUI table
                { name: "SKU" },
                { name: "Description" },
                { name: "Count" },
              ]}
              title={`Skus for ${email}`} //give the table a name
            />
          </div>
        </div>
      </>
    )
}

export default Affilates;
