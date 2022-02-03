import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  HashRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import { connect } from 'react-redux';
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import Main from "../Home/Main";
import Sanmar from "../Pages/Sanmar";
import Brightpearl from "../Pages/Brightpearl";
import "./App.css";
class App extends Component {

  render() {
    return (
      <Router>
        <div>
          <div id="Nav">
            <Nav />
          </div>
          <Switch>
            {/* Visiting localhost:3000 will redirect to localhost:3000/home */}

            <Route exact path="/" component={Main} />

            <Route exact path="/sanmar" component={Sanmar} />

            <Route exact path="/brightpearl" component={Brightpearl} />
            {/* If none of the other routes matched, we will show a 404. */}
            <Route render={() => <h1>404</h1>} />
          </Switch>
          <Footer />
        </div>
      </Router>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

// this allows us to use <App /> in index.js
export default connect(mapStateToProps)(App);
