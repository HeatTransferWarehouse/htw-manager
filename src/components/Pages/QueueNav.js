import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { Grid, TextField } from "@material-ui/core";
import FormatListBulletedIcon from "@material-ui/icons/FormatListBulleted";
import PlaylistAddCheckIcon from "@material-ui/icons/PlaylistAddCheck";
import EditIcon from "@material-ui/icons/Edit";

class QueueNav extends Component {
  state = {
    toggle: false,
    //changes colors of navbar when toggled, used to identify which queue we are in
    backgroundcolorclass: "queue-nav-link",
    activebackgroundcolorclass: "queue-active-nav-link",
    order_number: "",
  };

  componentDidMount() {
    //grab counts of everything
    this.props.dispatch({
      type: "GET_ITEM_LIST_COUNT",
    });
    this.props.dispatch({
      type: "GET_CUSTOM_ITEM_LIST_COUNT",
    });
    this.props.dispatch({
      type: "GET_PROGRESS_LIST_COUNT",
    });
    this.props.dispatch({
      type: "GET_COMPLETE_LIST_COUNT",
    });
  }

  handleChange = (event, fieldName) => {
    this.setState({ [fieldName]: event.target.value }); //sets to value of targeted event
  }; //end handleChange

  render() {
    return (
      <Grid container style={{}}>
        <Grid item xs={12} sm={12} md={2}></Grid>

        {/* Show these links if they are logged in*/}
        {this.state.toggle === false ? (
          <>
            {this.props.user.userReducer.id ? (
              <>
                <Grid item xs={12} sm={12} md={12} className="queue-container">
                  <NavLink
                    className={this.state.backgroundcolorclass}
                    to="/decoqueue"
                    activeClassName={this.state.activebackgroundcolorclass}>
                    <EditIcon></EditIcon>New{" "}
                    {/*used to display the count of all items in the new queue*/}
                    {`(${
                      this.props.itemlistcount[0] &&
                      this.props.itemlistcount[0].count
                    })`}
                  </NavLink>
                  <NavLink
                    className={this.state.backgroundcolorclass}
                    to="/progress"
                    activeClassName={this.state.activebackgroundcolorclass}>
                    <FormatListBulletedIcon></FormatListBulletedIcon>
                    In Progress{" "}
                    {`(${
                      this.props.progresslistcount[0] &&
                      this.props.progresslistcount[0].count
                    })`}
                  </NavLink>
                  <NavLink
                    className={this.state.backgroundcolorclass}
                    to="/complete"
                    activeClassName={this.state.activebackgroundcolorclass}>
                    <PlaylistAddCheckIcon></PlaylistAddCheckIcon>
                    Complete{" "}
                    {`(${
                      this.props.completelistcount[0] &&
                      this.props.completelistcount[0].count
                    })`}
                  </NavLink>
                  {this.props.user.userReducer.role === "csr" ? (
                    <>
                      <TextField
                        style={{
                          backgroundColor: "white",
                        }}
                        // value of local state as text value
                        value={this.state.order_number}
                        type="text"
                        maxLength={10000}
                        //runs handleChange on input change
                        onChange={(event) =>
                          this.handleChange(event, "order_number")
                        }></TextField>
                    </>
                  ) : (
                    <span></span>
                  )}
                </Grid>
                <Grid
                  item
                  xs={2}
                  sm={2}
                  md={2}
                  style={{
                    backgroundColor: this.state.backgroundcolor,
                    width: "30%",
                    float: "left",
                  }}>
                  <Grid
                    item
                    xs={1}
                    sm={1}
                    md={1}
                    style={{
                      backgroundColor: this.state.backgroundcolor,
                      width: "50%",
                      float: "left",
                    }}>
                    <div
                      style={{ float: "right" }}
                      onClick={(event) => {
                        event.preventDefault();
                        this.setState({
                          //toggles queue and nav color
                          toggle: !this.state.toggle,
                          backgroundcolor: "#8B008B",
                          backgroundcolorclass: "nav-link2",
                          activebackgroundcolorclass: "active-nav-link2",
                        });
                        this.props.dispatch({
                          type: "GET_QUEUE_ITEM_LIST",
                        });
                        this.props.dispatch({
                          type: "GET_ITEM_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_RESPOND_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_CONFIRM_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_CUSTOM_ITEM_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_PROGRESS_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_COMPLETE_LIST_COUNT",
                        });
                      }}></div>
                  </Grid>
                  <Grid
                    item
                    xs={3}
                    sm={3}
                    md={3}
                    style={{
                      backgroundColor: this.state.backgroundcolor,
                      width: "50%",
                      float: "left",
                    }}>
                    <div
                      style={{ float: "right" }}
                      onClick={(event) => {
                        event.preventDefault();
                        this.props.dispatch({
                          type: "GET_QUEUE_ITEM_LIST",
                        });
                        this.props.dispatch({
                          type: "GET_ITEM_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_RESPOND_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_CONFIRM_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_CUSTOM_ITEM_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_PROGRESS_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_COMPLETE_LIST_COUNT",
                        });
                      }}></div>
                  </Grid>
                  <Grid
                    item
                    xs={3}
                    sm={3}
                    md={3}
                    style={{
                      backgroundColor: this.state.backgroundcolor,
                      width: "50%",
                      float: "left",
                    }}></Grid>
                </Grid>
              </>
            ) : (
              <Grid
                item
                xs={12}
                sm={12}
                md={10}
                style={{
                  backgroundColor: this.state.backgroundcolor,
                  width: "15%",
                  float: "left",
                }}>
                <span></span>
              </Grid>
            )}
          </>
        ) : (
          <>
            {this.props.user.id ? (
              <>
                <Grid
                  item
                  xs={7}
                  sm={7}
                  md={8}
                  style={{
                    backgroundColor: this.state.backgroundcolor,
                    width: "15%",
                    float: "left",
                    borderRadius: "30px",
                  }}>
                  {this.props.user.userReducer.role === "csr" ? (
                    <>
                      <TextField
                        style={{
                          backgroundColor: "white",
                        }}
                        // value of local state as text value
                        value={this.state.order_number}
                        type="text"
                        maxLength={10000}
                        //runs handleChange on input change
                        onChange={(event) =>
                          this.handleChange(event, "order_number")
                        }></TextField>
                    </>
                  ) : (
                    <span></span>
                  )}
                </Grid>
                <Grid
                  item
                  xs={2}
                  sm={2}
                  md={2}
                  style={{
                    backgroundColor: this.state.backgroundcolor,
                    width: "30%",
                    float: "left",
                  }}>
                  <Grid
                    item
                    xs={1}
                    sm={1}
                    md={1}
                    style={{
                      backgroundColor: this.state.backgroundcolor,
                      width: "50%",
                      float: "left",
                    }}>
                    <div
                      style={{ float: "right", margin: "0px", padding: "0px" }}
                      onClick={(event) => {
                        event.preventDefault();
                        this.setState({
                          toggle: !this.state.toggle,
                          backgroundcolor: "#000080",
                          backgroundcolorclass: "queue-nav-link",
                          activebackgroundcolorclass: "queue-active-nav-link",
                        });
                        this.props.dispatch({
                          type: "GET_QUEUE_ITEM_LIST",
                        });
                        this.props.dispatch({
                          type: "GET_ITEM_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_RESPOND_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_CONFIRM_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_CUSTOM_ITEM_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_PROGRESS_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_COMPLETE_LIST_COUNT",
                        });
                      }}></div>
                  </Grid>
                  <Grid
                    item
                    xs={3}
                    sm={3}
                    md={3}
                    style={{
                      backgroundColor: this.state.backgroundcolor,
                      width: "50%",
                      float: "left",
                    }}>
                    <div
                      style={{ float: "right", margin: "0px", padding: "0px" }}
                      onClick={(event) => {
                        event.preventDefault();
                        this.props.dispatch({
                          type: "GET_QUEUE_ITEM_LIST",
                        });
                        this.props.dispatch({
                          type: "GET_ITEM_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_RESPOND_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_CONFIRM_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_CUSTOM_ITEM_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_PROGRESS_LIST_COUNT",
                        });
                        this.props.dispatch({
                          type: "GET_COMPLETE_LIST_COUNT",
                        });
                      }}></div>
                  </Grid>
                  <Grid
                    item
                    xs={3}
                    sm={3}
                    md={3}
                    style={{
                      backgroundColor: this.state.backgroundcolor,
                      width: "50%",
                      float: "left",
                    }}></Grid>
                </Grid>
              </>
            ) : (
              <Grid
                item
                xs={12}
                sm={12}
                md={10}
                style={{
                  backgroundColor: this.state.backgroundcolor,
                  width: "15%",
                  float: "left",
                }}>
                <span></span>
              </Grid>
            )}
          </>
        )}

        <></>
      </Grid>
    );
  }
}
//grab the count of all of the queues
const mapStateToProps = (state) => ({
  user: state.user,
  itemlist: state.queue.itemlist,
  progresslist: state.queue.progresslist,
  completelist: state.queue.completelist,
  // Count
  itemlistcount: state.queue.itemlistcount,
  progresslistcount: state.queue.progresslistcount,
  completelistcount: state.queue.completelistcount,
});

export default connect(mapStateToProps)(QueueNav);
