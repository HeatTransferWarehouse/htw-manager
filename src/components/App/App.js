import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  HashRouter as Router,
  Route,
  Switch,
} from "react-router-dom";
import { connect } from 'react-redux';
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import Register from "../RegisterForm/RegisterForm";
import Main from "../Home/Main";
import Sanmar from "../Pages/Sanmar";
import Brightpearl from "../Pages/Brightpearl";
import Resources from "../Pages/Resources";
import NoStock from "../Pages/NoStock";
import ProtectedRoute from "../ProtectedRoute/ProtectedRoute";
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

            <ProtectedRoute exact path="/" component={Main} />

            <Route exact path="/register" component={Register} />

            <ProtectedRoute exact path="/sanmar" component={Sanmar} />

            <ProtectedRoute exact path="/brightpearl" component={Brightpearl} />

            <ProtectedRoute exact path="/nostock" component={NoStock} />

            <ProtectedRoute exact path="/resources" component={Resources} />
            {/* If none of the other routes matched, we will show a 404. */}
            <Route render={() => <><br/><br/><br/><br/><br/><br/><h1 className="fourfour">404</h1></>} />
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
