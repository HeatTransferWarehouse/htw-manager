import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Grid } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import "./LoginPage.css";

class LoginPage extends Component {
  state = {
    username: "",
    password: "",
    //error value used to conditionally render error toasts, default is false
    error: false,
  };

  //function ran when user logs in
  login = (event) => {
    //prevents any default actions
    event.preventDefault();
    //validates username and password on login, this info is also validated
    //on the server
    if (this.state.username && this.state.password) {
      //redux sagas for login
      this.props.dispatch({
        type: "LOGIN",
        payload: {
          username: this.state.username,
          password: this.state.password,
        },
      });
    } else {
      //error message if login failed or info is not validated
      this.props.dispatch({ type: "LOGIN_INPUT_ERROR" });
    }
    //this makes it so whenever a user logs in, they go straight to homepage
    this.props.history.push("/");
  }; // end login
  //This function handles storing input values into state on change
  handleInputChangeFor = (propertyName) => (event) => {
    this.setState({
      [propertyName]: event.target.value,
    });
  }; //end handleInputChangeFor
  render() {
    return (
      <div className="login">
        <div>
          <div>
            <center>
              {/* if error in state is true, render this alert, shows up as a toast
            and conditionally renders based on value in state */}
              {this.state.error === true && (
                <Alert className="error" style={{}} severity="error">
                  Please provide your email address
                </Alert>
              )}
              {/* line breaks for spacing */}
              <br />
              <br />
              <>
                {/* start login form */}
                <form onSubmit={this.login} className="reglogin">
                  <h2>HTW Admin Login</h2>
                  <div className="login-inputs">
                    <div className="login-input">
                      {/* enter email address here */}
                      <label style={{ marginLeft: "5px" }} htmlFor="username">
                        EMAIL
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={this.state.username}
                        onChange={this.handleInputChangeFor("username")}
                      />
                    </div>
                    {/* enter password here */}
                    <div className="login-input">
                      <label style={{ marginLeft: "5px" }} htmlFor="password">
                        PASSWORD
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={this.state.password}
                        onChange={this.handleInputChangeFor("password")}
                      />
                    </div>
                  </div>
                  {/* runs the login function on submit */}
                  <button className="log-in" type="submit">
                    Login
                  </button>
                  {/* runs login error toast */}
                  {/* {this.props.errors.loginMessage && (
                    <Alert className="loginError" style={{}} severity="error">
                      {this.props.errors.loginMessage}
                    </Alert>
                  )} */}
                </form>
              </>
            </center>
            <center></center>
          </div>
          <Grid item xs={12} sm={12} md={7} style={{ display: "block" }}>
            {/* logo on login page */}
          </Grid>
        </div>
      </div>
    ); //end return
  } //end render
} //end LoginPage

// Instead of taking everything from state, we just want the error messages.
const mapStateToProps = (state) => ({
  errors: state.errors,
});

export default connect(mapStateToProps)(LoginPage);
