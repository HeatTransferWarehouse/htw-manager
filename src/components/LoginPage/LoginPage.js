import React, { Component } from "react";
import { connect } from "react-redux";
import { Grid } from "@material-ui/core";
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
      <>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
      <Grid container style={{}}>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <Grid item xs={12} sm={12} md={8} style={{ display: "block" }}>
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
                  <br />
                  <div>
                    {/* enter email address here */}
                    <label htmlFor="username">
                      Email: &nbsp; &nbsp; &nbsp;{" "}
                      {/*Creates a blank space, used for lining things up */}
                      <input
                        type="text"
                        name="username"
                        value={this.state.username}
                        onChange={this.handleInputChangeFor("username")}
                      />
                    </label>
                  </div>
                  {/* enter password here */}
                  <div>
                    <label htmlFor="password">
                      Password: &nbsp;
                      <input
                        type="password"
                        name="password"
                        value={this.state.password}
                        onChange={this.handleInputChangeFor("password")}
                      />
                    </label>
                  </div>
                  <div>
                    {/* runs the login function on submit */}
                    <input
                      className="log-in"
                      type="submit"
                      name="submit"
                      value="Log In"
                    />
                  </div>
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
        </Grid>
        <Grid item xs={12} sm={12} md={7} style={{ display: "block" }}>
          {/* logo on login page */}
        </Grid>
      </Grid>
    </>
    ); //end return
  } //end render
} //end LoginPage

// Instead of taking everything from state, we just want the error messages.
const mapStateToProps = (state) => ({
  errors: state.errors,
});

export default connect(mapStateToProps)(LoginPage);
