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
import Affilates from "../Pages/Affiliates";
import ProtectedRoute from "../ProtectedRoute/ProtectedRoute";
import AdminRoute from "../ProtectedRoute/AdminRoute";
import WallyB from "../Pages/WallyB";
import Admin from "../Pages/Admin";
import Login from "../LoginPage/LoginPage";
import Supacolor from "../Pages/Supacolor";
import DecoQueue from "../Pages/DecoQueue";
import Progress from "../Pages/Progress";
import QueueNav from "../Pages/QueueNav";
import "./App.css";
function App () {

    return (
      <Router>
        <div>
          <div id="Nav">
            <Nav />
          </div>
          <Switch>
            <Route exact path="/login" component={Login} />

            <Route exact path="/" component={Main} />

            <Route exact path="/sanmar" component={Sanmar} />

            <Route exact path="/brightpearl" component={Brightpearl} />

            <Route exact path="/nostock" component={NoStock} />

            <Route exact path="/affiliates" component={Affilates} />

            <Route exact path="/resources" component={Resources} />

            <Route exact path="/supacolor" component={Supacolor} />

            <Route exact path="/wallyb" component={WallyB} />

            <Route exact path="/register" component={Register} />

            <Route exact path="/decoqueue" component={DecoQueue} />

            <Route exact path="/Progress" component={Progress} />

            <Route exact path="/Complete" component={DecoQueue} />

            <Route exact path="/admin" component={Admin} />
            {/* If none of the other routes matched, we will show a 404. */}
            <Route render={() => <><br/><br/><br/><br/><br/><br/><h1 className="fourfour">404</h1></>} />
          </Switch>
          <Footer />
        </div>
      </Router>
    );
  }


// const mapStateToProps = (state) => ({
//   user: state.user,
// });

// this allows us to use <App /> in index.js
export default App;
