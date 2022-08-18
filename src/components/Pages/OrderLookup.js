import React from "react";
import { TextField, Button } from "@material-ui/core";
import Form from "react-bootstrap/Form";
import Paper from "@material-ui/core/Paper";

function OrderLookupPage () {
  state = {
    toggle: false,
    order_number: "",
    weight: 0,
    ship_from: "Fargo",
  };

  //This function handles storing input values into state on change
  handleChange = (event, fieldName) => {
    this.setState({ [fieldName]: event.target.value });
  }; //end handleChange

  //this function sends information to the server to store in the database
  orderLookup = (event) => {
    //prevents any default actions
    event.preventDefault();
    //grabs local state and defines it in a var of the same name
    const { order_number } = this.state;
    this.props.dispatch({
      type: "ORDER_DETAILS",
      payload: {
        order_number: order_number,
      },
    });
    this.props.dispatch({
      type: "ORDER_LOOKUP",
      payload: {
        order_number: order_number,
      },
    });
    this.props.dispatch({
      type: "SHIPPING_LOOKUP",
      payload: {
        order_number: order_number,
      },
    });
    this.props.dispatch({
      type: "PRODUCT_LOOKUP",
      payload: {
        order_number: order_number,
      },
    });
    this.setState({
      weight: 0,
    });

    setTimeout(() => {
      console.log(this.props.detailslist);
      this.props.detailslist.map((item, index) => {
        console.log("I'm being run");
        let weight = this.state.weight;
        let newWeight = Number(item.weight);
        weight += newWeight;
        this.setState({
          weight: weight,
        });
      });
    }, 1000);
  }; //ends SubmitInfo

    let skuHolder = "";
    let productlist = this.props.productlist;
    let itemid = this.props.orderlist.id;
    let status = this.props.orderlist.status;
    let items_total = this.props.orderlist.items_total;
    let items_shipped = this.props.orderlist.items_shipped;
    let payment_status = this.props.orderlist.payment_status;
    let shipping_first_name =
      this.props.shippinglist[0] && this.props.shippinglist[0].first_name;
    let shipping_last_name =
      this.props.shippinglist[0] && this.props.shippinglist[0].last_name;
    let shipping_street_1 =
      this.props.shippinglist[0] && this.props.shippinglist[0].street_1;
    let shipping_street_2 =
      this.props.shippinglist[0] && this.props.shippinglist[0].street_2;
    let shipping_city =
      this.props.shippinglist[0] && this.props.shippinglist[0].city;
    let shipping_state =
      this.props.shippinglist[0] && this.props.shippinglist[0].state;
    let shipping_zip =
      this.props.shippinglist[0] && this.props.shippinglist[0].zip;
    let shipping_country =
      this.props.shippinglist[0] && this.props.shippinglist[0].country;
    let shipping_phone =
      this.props.shippinglist[0] && this.props.shippinglist[0].phone;
    let shipping_email =
      this.props.shippinglist[0] && this.props.shippinglist[0].email;
    let weightDOM = this.state.weight;
    weightDOM = weightDOM.toFixed(2);
    if (shipping_state === "Alabama" || shipping_state === "alabama") {
      shipping_state = "AL";
    } else if (shipping_state === "Alaska" || shipping_state === "alaska") {
      shipping_state = "AK";
    } else if (shipping_state === "Arizona" || shipping_state === "arizona") {
      shipping_state = "AZ";
    } else if (shipping_state === "Arkansas" || shipping_state === "arkansas") {
      shipping_state = "AR";
    } else if (
      shipping_state === "California" ||
      shipping_state === "California"
    ) {
      shipping_state = "CA";
    } else if (shipping_state === "Colorado" || shipping_state === "colorado") {
      shipping_state = "CO";
    } else if (
      shipping_state === "Connecticut" ||
      shipping_state === "connecticut"
    ) {
      shipping_state = "CT";
    } else if (shipping_state === "Delaware" || shipping_state === "delaware") {
      shipping_state = "DE";
    } else if (
      shipping_state === "District of Columbia" ||
      shipping_state === "district of columbia"
    ) {
      shipping_state = "D.C.";
    } else if (shipping_state === "Florida" || shipping_state === "florida") {
      shipping_state = "FL";
    } else if (shipping_state === "Georgia" || shipping_state === "georgia") {
      shipping_state = "GA";
    } else if (shipping_state === "Hawaii" || shipping_state === "hawaii") {
      shipping_state = "HI";
    } else if (shipping_state === "Idaho" || shipping_state === "idaho") {
      shipping_state = "ID";
    } else if (shipping_state === "Illinois" || shipping_state === "illinois") {
      shipping_state = "IL";
    } else if (shipping_state === "Indiana" || shipping_state === "indiana") {
      shipping_state = "IN";
    } else if (shipping_state === "Iowa" || shipping_state === "iowa") {
      shipping_state = "IA";
    } else if (shipping_state === "Kansas" || shipping_state === "kansas") {
      shipping_state = "KS";
    } else if (shipping_state === "Kentucky" || shipping_state === "kentucky") {
      shipping_state = "KY";
    } else if (
      shipping_state === "Louisiana" ||
      shipping_state === "louisiana"
    ) {
      shipping_state = "LA";
    } else if (shipping_state === "Maine" || shipping_state === "maine") {
      shipping_state = "ME";
    } else if (shipping_state === "Maryland" || shipping_state === "maryland") {
      shipping_state = "MD";
    } else if (
      shipping_state === "Massachusetts" ||
      shipping_state === "massachusetts"
    ) {
      shipping_state = "MA";
    } else if (shipping_state === "Michigan" || shipping_state === "michigan") {
      shipping_state = "MI";
    } else if (
      shipping_state === "Minnesota" ||
      shipping_state === "minnesota"
    ) {
      shipping_state = "MN";
    } else if (
      shipping_state === "Mississippi" ||
      shipping_state === "mississippi"
    ) {
      shipping_state = "MS";
    } else if (shipping_state === "Missouri" || shipping_state === "missouri") {
      shipping_state = "MO";
    } else if (shipping_state === "Nebraska" || shipping_state === "nebraska") {
      shipping_state = "NE";
    } else if (shipping_state === "Nevada" || shipping_state === "nevada") {
      shipping_state = "NV";
    } else if (
      shipping_state === "New Hampshire" ||
      shipping_state === "new hampshire"
    ) {
      shipping_state = "NH";
    } else if (
      shipping_state === "New Jersey" ||
      shipping_state === "new jersey"
    ) {
      shipping_state = "NJ";
    } else if (
      shipping_state === "New Mexico" ||
      shipping_state === "new mexico"
    ) {
      shipping_state = "NM";
    } else if (shipping_state === "New York" || shipping_state === "new york") {
      shipping_state = "NY";
    } else if (
      shipping_state === "North Carolina" ||
      shipping_state === "north carolina"
    ) {
      shipping_state = "NC";
    } else if (
      shipping_state === "North Dakota" ||
      shipping_state === "north dakota"
    ) {
      shipping_state = "ND";
    } else if (shipping_state === "Ohio" || shipping_state === "ohio") {
      shipping_state = "OH";
    } else if (shipping_state === "Oklahoma" || shipping_state === "oklahoma") {
      shipping_state = "OK";
    } else if (shipping_state === "Oregon" || shipping_state === "oregon") {
      shipping_state = "OR";
    } else if (
      shipping_state === "Pennsylvania" ||
      shipping_state === "pennsylvania"
    ) {
      shipping_state = "PA";
    } else if (
      shipping_state === "Rhode Island" ||
      shipping_state === "rhode island"
    ) {
      shipping_state = "RI";
    } else if (
      shipping_state === "South Carolina" ||
      shipping_state === "south carolina"
    ) {
      shipping_state = "SC";
    } else if (
      shipping_state === "South Dakota" ||
      shipping_state === "south dakota"
    ) {
      shipping_state = "SD";
    } else if (
      shipping_state === "Tennessee" ||
      shipping_state === "tennessee"
    ) {
      shipping_state = "TN";
    } else if (shipping_state === "Texas" || shipping_state === "texas") {
      shipping_state = "TX";
    } else if (shipping_state === "Utah" || shipping_state === "utah") {
      shipping_state = "UT";
    } else if (shipping_state === "Vermont" || shipping_state === "vermont") {
      shipping_state = "VT";
    } else if (shipping_state === "Virginia" || shipping_state === "virginia") {
      shipping_state = "VA";
    } else if (
      shipping_state === "Washington" ||
      shipping_state === "washington"
    ) {
      shipping_state = "WA";
    } else if (
      shipping_state === "West Virginia" ||
      shipping_state === "west virginia"
    ) {
      shipping_state = "WV";
    } else if (
      shipping_state === "Wisconsin" ||
      shipping_state === "wisconsin"
    ) {
      shipping_state = "WI";
    } else if (shipping_state === "Wyoming" || shipping_state === "wyoming") {
      shipping_state = "WY";
    }



    return (
      <div>
        {this.state.toggle === false ? (
          <>
            <br />
            <br />
            <Paper
              elevation={5}
              style={{
                padding: "5%",
                marginLeft: "5%",
                marginRight: "5%",
                marginBottom: "5%",
              }}
            >
              <form onSubmit={this.orderLookup}>
                <center>
                  <p>Type the order number in below</p>
                  <TextField
                    style={{
                      backgroundColor: "white",
                      margin: "5px",
                    }}
                    variant="outlined"
                    label="Order Number here"
                    name="order_number"
                    // sets value of input to local state
                    value={this.state.order_number}
                    type="text"
                    maxLength={1000}
                    //onChange of input values set local state
                    onChange={(event) =>
                      this.handleChange(event, "order_number")
                    } //onChange of input values set local state
                  />
                </center>
                <center>
                  <p>
                    Select your ship from warehouse NOTE: Warehouse use only
                  </p>
                  <Form.Control
                    style={{ width: "300px" }}
                    as="select"
                    onChange={(event) =>
                      this.setState({ ship_from: event.target.value })
                    }
                  >
                    {" "}
                    <option value="Fargo">Fargo </option>{" "}
                    <option value="Cincinnati">Cincinnati </option>{" "}
                    <option value="Vegas">Vegas </option>{" "}
                    <option value="Jacksonville">Jacksonville </option>{" "}
                  </Form.Control>
                </center>
                <center>
                  <Button
                    style={{
                      //note that it only goes through if it passes all validation
                      marginTop: "3%",
                      marginLeft: "5%",
                      marginRight: "5%",
                      backgroundColor: "green",
                      color: "white",
                    }}
                    variant="contained"
                    type="submit"
                    color="primary"
                    className="button"
                  >
                    CheckOrder
                  </Button>
                </center>
              </form>
              <table
                style={{
                  marginLeft: "200px",
                  marginRight: "auto",
                  marginTop: "20px",
                  width: "100%",
                }}
              >
                <tr>
                  <td
                    style={{
                      marginLeft: "3%",
                      padding: "10px",
                      width: "25%",
                    }}
                    className="order_number"
                  >
                    <b>Order Number:</b> <i>{itemid}</i>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      marginLeft: "3%",
                      padding: "10px",
                      width: "25%",
                    }}
                    className="status"
                  >
                    <b>Status:</b> <i>{status}</i>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      marginLeft: "3%",
                      padding: "10px",
                      width: "25%",
                    }}
                    className="total_items"
                  >
                    <b>Total Items:</b> <i>{items_total}</i>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      marginLeft: "3%",
                      padding: "10px",
                      width: "25%",
                    }}
                    className="total_items_shipped"
                  >
                    <b>Total Items Shipped:</b> <i>{items_shipped}</i>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      marginLeft: "3%",
                      padding: "10px",
                      width: "25%",
                    }}
                    className="payment_status"
                  >
                    <b>Payment Status:</b> <i>{payment_status}</i>
                  </td>
                </tr>
                <br />
                <tr>
                  <td
                    style={{
                      marginLeft: "3%",
                      padding: "10px",
                      width: "25%",
                    }}
                  >
                    <b>Shipping Address</b>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      marginLeft: "3%",
                      padding: "10px",
                      width: "25%",
                    }}
                    className="shipping_first_name"
                  >
                    <b>Name:</b>{" "}
                    <i>
                      {shipping_first_name} {shipping_last_name}
                    </i>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      marginLeft: "3%",
                      padding: "10px",
                      width: "25%",
                    }}
                    className="shipping_street_1"
                  >
                    <b>Street:</b> <i>{shipping_street_1}</i>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      marginLeft: "3%",
                      padding: "10px",
                      width: "25%",
                    }}
                    className="shipping_street_2"
                  >
                    <b>Street 2:</b> <i>{shipping_street_2}</i>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      marginLeft: "3%",
                      padding: "10px",
                      width: "25%",
                    }}
                    className="shipping_city_state"
                  >
                    <b>City, State and Zip:</b>{" "}
                    <i>
                      {shipping_city} {shipping_state} {shipping_zip}
                    </i>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      marginLeft: "3%",
                      padding: "10px",
                      width: "25%",
                    }}
                    className="shipping_zip"
                  >
                    <b>Zip:</b> <i>{shipping_zip}</i>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      marginLeft: "3%",
                      padding: "10px",
                      width: "25%",
                    }}
                    className="shipping_country"
                  >
                    <b>Country:</b> <i>{shipping_country}</i>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      marginLeft: "3%",
                      padding: "10px",
                      width: "25%",
                    }}
                    className="shipping_phone"
                  >
                    <b>Phone:</b> <i>{shipping_phone}</i>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      marginLeft: "3%",
                      padding: "10px",
                      width: "25%",
                    }}
                    className="shipping_email"
                  >
                    <b>Email:</b> <i>{shipping_email}</i>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      marginLeft: "3%",
                      padding: "10px",
                      width: "25%",
                    }}
                    className="shipping_city"
                  >
                    <b>City</b> <i>{shipping_city}</i>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      marginLeft: "3%",
                      padding: "10px",
                      width: "25%",
                    }}
                    className="shipping_state"
                  >
                    <b>State:</b> <i>{shipping_state}</i>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      marginLeft: "3%",
                      padding: "10px",
                      width: "25%",
                    }}
                    className="weight"
                  >
                    <b>Weight:</b> <i>{weightDOM}</i>
                  </td>
                </tr>
                <br />
                <br />
                <b>Ship From Address</b>
                <br />
                <br />
                {this.state.ship_from === "Cincinnati" ? (
                  <>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_address_1"
                      >
                        <b>Address 1:</b> <i>1445 Jamike Ave</i>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_address_2"
                      >
                        <b>Address 2:</b> <i>Suite 200</i>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_zip"
                      >
                        <b>Zip:</b> <i>41018</i>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_city"
                      >
                        <b>City:</b> <i>Erlanger</i>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_state"
                      >
                        <b>State:</b> <i>KY</i>
                      </td>
                    </tr>
                  </>
                ) : (
                  <span></span>
                )}
                {this.state.ship_from === "Vegas" ? (
                  <>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_address_1"
                      >
                        <b>Address 1:</b> <i>7585 Commercial way</i>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_address_2"
                      >
                        <b>Address 2:</b> <i>Suite B</i>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_zip"
                      >
                        <b>Zip:</b> <i>89011</i>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_city"
                      >
                        <b>City:</b> <i>Henderson</i>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_state"
                      >
                        <b>State:</b> <i>NV</i>
                      </td>
                    </tr>
                  </>
                ) : (
                  <span></span>
                )}
                {this.state.ship_from === "Jacksonville" ? (
                  <>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_address_1"
                      >
                        <b>Address 1:</b> <i>13291 Vantage Way</i>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_address_2"
                      >
                        <b>Address 2:</b> <i>Suite 104</i>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_zip"
                      >
                        <b>Zip:</b> <i>32218</i>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_city"
                      >
                        <b>City:</b> <i>Jacksonville</i>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_state"
                      >
                        <b>State:</b> <i>FL</i>
                      </td>
                    </tr>
                  </>
                ) : (
                  <span></span>
                )}
                {this.state.ship_from === "Fargo" ? (
                  <>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_address_1"
                      >
                        <b>Address 1:</b> <i>1501 21st Ave N</i>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_address_2"
                      >
                        <b>Address 2:</b> <i>Suite B</i>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_zip"
                      >
                        <b>Zip:</b> <i>58102</i>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_city"
                      >
                        <b>City:</b> <i>Fargo</i>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          marginLeft: "3%",
                          padding: "10px",
                          width: "25%",
                        }}
                        className="ship_from_state"
                      >
                        <b>State:</b> <i>ND</i>
                      </td>
                    </tr>
                  </>
                ) : (
                  <span></span>
                )}
                <br />
                <br />
                <tr>
                  <td>
                    <b>Products</b>
                  </td>
                </tr>
                {productlist.map((item, index) => [
                  item.sku.slice(0, 5) === "BL_A3" ||
                  item.sku.slice(0, 5) === "BL_A4" ||
                  item.sku.slice(0, 5) === "BL_A5" ||
                  item.sku.slice(0, 5) === "BL_LC" ||
                  item.sku.slice(0, 5) === "BL_SM" ||
                  item.sku.slice(0, 6) === "HW_CAP" ||
                  item.sku.slice(0, 6) === "PR_BAG" ||
                  item.sku.slice(0, 6) === "PR_UM_" ||
                  item.sku.slice(0, 5) === "SB_A5" ||
                  item.sku.slice(0, 5) === "SB_A4" ||
                  item.sku.slice(0, 5) === "SB_A3" ||
                  item.sku.slice(0, 5) === "SB_LC" ||
                  item.sku.slice(0, 5) === "SB_SM" ||
                  item.sku.slice(0, 5) === "SB_LS" ||
                  item.sku.slice(0, 5) === "WE_SM" ||
                  item.sku.slice(0, 5) === "WE_LC" ||
                  item.sku.slice(0, 5) === "WE_A5" ||
                  item.sku.slice(0, 5) === "WE_A4" ||
                  item.sku.slice(0, 5) === "WE_A3" ||
                  item.sku.slice(0, 5) === "WE_SQ" ||
                  item.sku.slice(0, 5) === "WE_SU" ||
                  item.sku.slice(0, 5) === "BL_SU" ||
                  item.sku.slice(0, 5) === "SB_SU" ||
                  item.sku.slice(0, 10) === "INKSOFT-WE" ||
                  item.sku.slice(0, 10) === "INKSOFT-SU" ||
                  item.sku.slice(0, 10) === "INKSOFT-SO" ||
                  item.sku.slice(0, 10) === "INKSOFT-PR" ||
                  item.sku.slice(0, 10) === "INKSOFT-HE" ||
                  item.sku.slice(0, 5) === "WE_XS" ? (
                    <>
                      <tr>
                        <td
                          style={{
                            marginLeft: "3%",
                            padding: "10px",
                            width: "25%",
                          }}
                          className={"sku" + index}
                        >
                          <b>SKU:</b>{" "}
                          <i>
                            {" "}
                            {item.sku.slice(0, 5) === "BL_A3"
                              ? (skuHolder = "BL_A3")
                              : item.sku === "INKSOFT-SUB-BLOCKER-8"
                              ? (skuHolder = "BL_A3")
                              : item.sku.slice(0, 7) === "BL_A4-1"
                              ? (skuHolder = 'BL_A4:SubBlock-A4 16.5" 5.85"')
                              : item.sku === "INKSOFT-SUB-BLOCKER-6"
                              ? (skuHolder = 'BL_A4 16.5')
                              : item.sku.slice(0, 7) === "BL_A4-8"
                              ? (skuHolder = 'BL_A4:SubBlock-A4 8.3" 11.7"')
                              : item.sku === "INKSOFT-SUB-BLOCKER-5"
                              ? (skuHolder = 'BL_A4 8.3')
                              : item.sku.slice(0, 7) === "BL_A5-1"
                              ? (skuHolder = 'BL_A5:SubBlock-A5 11.7" 4.25"')
                              : item.sku === "INKSOFT-SUB-BLOCKER-4"
                              ? (skuHolder = 'BL_A5 11.7')
                              : item.sku.slice(0, 7) === "BL_A5-5"
                              ? (skuHolder = 'BL_A5:SubBlock-A5 5.8" 8.3"')
                              : item.sku === "INKSOFT-SUB-BLOCKER-3"
                              ? (skuHolder = 'BL_A5 5.8')
                              : item.sku.slice(0, 5) === "BL_LC"
                              ? (skuHolder = "BL_LC")
                              : item.sku === "INKSOFT-SUB-BLOCKER-2"
                              ? (skuHolder = "BL_LC")
                              : item.sku === "INKSOFT-SUB-BLOCKER-9"
                              ? (skuHolder = "BL_XS")
                              : item.sku.slice(0, 5) === "BL_SM"
                              ? (skuHolder = "BL_SM")
                              : item.sku === "INKSOFT-SUB-BLOCKER-7"
                              ? (skuHolder = "BL_SQ")
                              : item.sku === "INKSOFT-SUB-BLOCKER-1"
                              ? (skuHolder = "BL_SM")
                              : item.sku.slice(0, 8) === "HW_CAP_L"
                              ? (skuHolder = "HW_CAP_L")
                              : item.sku === "INKSOFT-HEAD-2"
                              ? (skuHolder = "HW_CAP_L")
                              : item.sku.slice(0, 8) === "HW_CAP_S"
                              ? (skuHolder = "HW_CAP_S")
                              : item.sku === "INKSOFT-HEAD-1"
                              ? (skuHolder = "HW_CAP_S")
                              : item.sku.slice(0, 11) === "PR_BAG_A4-1"
                              ? (skuHolder = "PR_BAG_A4:BAG-A4 16.5")
                              : item.sku === "INKSOFT-PROMO-5"
                              ? (skuHolder = "PR_BAG_A4:BAG-A4 16.5")
                              : item.sku.slice(0, 11) === "PR_BAG_A4-8"
                              ? (skuHolder = "PR_BAG_A4:BAG-A4 8.3")
                              : item.sku === "INKSOFT-PROMO-4"
                              ? (skuHolder = "PR_BAG_A4:BAG-A4 8.3")
                              : item.sku === "INKSOFT-PROMO-6"
                              ? (skuHolder = "PR_BAG_A3:Bag-A3 11.7")
                              : item.sku.slice(0, 11) === "PR_BAG_A5-1"
                              ? (skuHolder = "PR_BAG_A5:Bag-A5 11.7")
                              : item.sku === "INKSOFT-PROMO-3"
                              ? (skuHolder = "PR_BAG_A5:Bag-A5 11.7")
                              : item.sku.slice(0, 11) === "PR_BAG_A5-5"
                              ? (skuHolder = "PR_BAG_A5:Bag-A5 5.8")
                              : item.sku === "INKSOFT-PROMO-2"
                              ? (skuHolder = "PR_BAG_A5:Bag-A5 5.8")
                              : item.sku.slice(0, 11) === "PR_BAG_A6-4"
                              ? (skuHolder = "PR_BAG_A6:Bag-A6 4.1")
                              : item.sku === "INKSOFT-PROMO-1"
                              ? (skuHolder = "PR_BAG_A6:Bag-A6 4.1")
                              : item.sku.slice(0, 8) === "PR_UM_A3"
                              ? (skuHolder = "PR_UM_A3")
                              : item.sku.slice(0, 11) === "PR_UM_A4-11"
                              ? (skuHolder = "PR_UM_A4 11.7")
                              : item.sku.slice(0, 11) === "PR_UM_A4-16"
                              ? (skuHolder = "PR_UM_A4 16.5")
                              : item.sku.slice(0, 11) === "PR_UM_A5-11"
                              ? (skuHolder = "PR_UM_A5 11.7")
                              : item.sku.slice(0, 10) === "PR_UM_A5-5"
                              ? (skuHolder = "PR_UM_A5 5.8")
                              : item.sku.slice(0, 5) === "SB_A3"
                              ? (skuHolder = "SB_A3")
                              : item.sku === "INKSOFT-SOFT-SHELL-8"
                              ? (skuHolder = "SB_A3")
                              : item.sku.slice(0, 7) === "SB_A4-1"
                              ? (skuHolder = "SB_A4 16.5")
                              : item.sku === "INKSOFT-SOFT-SHELL-6"
                              ? (skuHolder = "SB_A4 16.5")
                              : item.sku.slice(0, 7) === "SB_A4-8"
                              ? (skuHolder = "SB_A4 8.3")
                              : item.sku === "INKSOFT-SOFT-SHELL-5"
                              ? (skuHolder = "SB_A4 8.3")
                              : item.sku.slice(0, 8) === "SB_A5-11"
                              ? (skuHolder = "SB_A5 11.7")
                              : item.sku === "INKSOFT-SOFT-SHELL-4"
                              ? (skuHolder = "SB_A5 11.7")
                              : item.sku.slice(0, 7) === "SB_A5-5"
                              ? (skuHolder = "SB_A5 5.8")
                              : item.sku === "INKSOFT-SOFT-SHELL-3"
                              ? (skuHolder = "SB_A5 5.8")
                              : item.sku.slice(0, 5) === "SB_LC"
                              ? (skuHolder = "SB_LC")
                              : item.sku === "INKSOFT-SOFT-SHELL-2"
                              ? (skuHolder = "SB_LC")
                              : item.sku.slice(0, 5) === "SB_SM"
                              ? (skuHolder = "SB_SM")
                              : item.sku === "INKSOFT-SOFT-SHELL-1"
                              ? (skuHolder = "SB_SM")
                              : item.sku === "INKSOFT-SOFT-SHELL-9"
                              ? (skuHolder = "SB_XS")
                              : item.sku === "INKSOFT-SOFT-SHELL-7"
                              ? (skuHolder = "SB_SQ")
                              : item.sku.slice(0, 5) === "WE_A3"
                              ? (skuHolder = "WE_A3")
                              : item.sku === "INKSOFT-WEARABLES-9"
                              ? (skuHolder = "WE_A3")
                              : item.sku.slice(0, 8) === "WE_A4-16"
                              ? (skuHolder = "WE_A4 16.5")
                              : item.sku === "INKSOFT-WEARABLES-7"
                              ? (skuHolder = "WE_A4 16.5")
                              : item.sku.slice(0, 7) === "WE_A4-8"
                              ? (skuHolder = "WE_A4 8.3")
                              : item.sku === "INKSOFT-WEARABLES-6"
                              ? (skuHolder = "WE_A4 8.3")
                              : item.sku.slice(0, 8) === "WE_A5-11"
                              ? (skuHolder = "WE_A5 11.7")
                              : item.sku === "INKSOFT-WEARABLES-5"
                              ? (skuHolder = "WE_A5 11.7")
                              : item.sku.slice(0, 7) === "WE_A5-5"
                              ? (skuHolder = "WE_A5 5.8")
                              : item.sku === "INKSOFT-WEARABLES-4"
                              ? (skuHolder = "WE_A5 5.8")
                              : item.sku.slice(0, 5) === "WE_LC"
                              ? (skuHolder = "WE_LC")
                              : item.sku === "INKSOFT-WEARABLES-3"
                              ? (skuHolder = "WE_LC")
                              : item.sku.slice(0, 5) === "WE_SM"
                              ? (skuHolder = "WE_SM")
                              : item.sku === "INKSOFT-WEARABLES-2"
                              ? (skuHolder = "WE_SM")
                              : item.sku.slice(0, 5) === "WE_SQ"
                              ? (skuHolder = "WE_SQ")
                              : item.sku === "INKSOFT-WEARABLES-8"
                              ? (skuHolder = "WE_SQ")
                              : item.sku.slice(0, 5) === "WE_XS"
                              ? (skuHolder = "WE_XS")
                              : item.sku === "INKSOFT-WEARABLES-1"
                              ? (skuHolder = "WE_XS")
                              : item.sku.slice(0, 11) === "WE_SUPAGANG"
                              ? (skuHolder = "WE_SUPAGANG")
                              : item.sku === "INKSOFT-WEARABLES-10"
                              ? (skuHolder = "WE_SUPAGANG")
                              : item.sku.slice(0, 11) === "BL_SUPAGANG" 
                              ? (skuHolder = "BL_SUPAGANG")
                              : item.sku === "INKSOFT-SUB-BLOCKER-10"
                              ? (skuHolder = "BL_SUPAGANG")
                              : item.sku.slice(0, 11) === "SB_SUPAGANG" 
                              ? (skuHolder = "SB_SUPAGANG")
                              : item.sku === "INKSOFT-SOFT-SHELL-10"
                              ? (skuHolder = "SB_SUPAGANG")
                              : (skuHolder = "SB_SM")}
                          </i>
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            marginLeft: "3%",
                            padding: "10px",
                            width: "25%",
                          }}
                          className={"qty" + index}
                        >
                          <b>QTY:</b> <i>{item.quantity}</i>
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            marginLeft: "3%",
                            padding: "10px",
                            width: "25%",
                          }}
                          className={"qty" + index}
                        >
                          <b>Color/Type:</b>{" "}
                          <i>
                            {item.product_options[4].display_value}{" - "}
                            {item.product_options[3].display_value}
                          </i>
                        </td>
                      </tr>
                    </>
                  ) : (
                    <span></span>
                  ),
                ])}
              </table>
            </Paper>
            <br />{" "}
            {/*Add a little buffer on the bottom of page (prevent cutoff on mobile) */}
            <br />
          </>
        ) : (
          <>
            <br />
            <br />
            <br />
            <br />
            {/*show this only after the customer has submitted, to confirm submission and also prevent duplicate submissions*/}
            <h1 style={{ textAlign: "center" }}>
              Thank you for your feedback.
              <br /> The art department will follow up with you after they've
              reviewed your response
            </h1>
          </>
        )}
      </div>
    );
}

const mapStateToProps = (state) => ({
  orderlist: state.item.orderlist,
  shippinglist: state.item.shippinglist,
  productlist: state.item.productlist,
  detailslist: state.item.detailslist,
});

export default OrderLookupPage;
