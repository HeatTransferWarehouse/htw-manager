import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  HashRouter as Router,
  Route,
  Switch,
} from "react-router-dom";
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
import Complete from "../Pages/Complete";
import OrderLookup from "../Pages/OrderLookup";
import OrderLookupOLD from "../Pages/OrderLookupOLD";
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

            <Route exact path="/orderlookup" component={OrderLookup} />

            <Route exact path="/orderlookupold" component={OrderLookupOLD} />

            <Route exact path="/accountlookup" component={OrderLookup} />

            <ProtectedRoute exact path="/" component={Main} />

            <ProtectedRoute exact path="/sanmar" component={Sanmar} />

            <ProtectedRoute exact path="/brightpearl" component={Brightpearl} />

            <ProtectedRoute exact path="/nostock" component={NoStock} />

            <ProtectedRoute exact path="/affiliates" component={Affilates} />

            <ProtectedRoute exact path="/resources" component={Resources} />

            <ProtectedRoute exact path="/decoqueue" component={DecoQueue} />

            <ProtectedRoute exact path="/progress" component={Progress} />

            <ProtectedRoute exact path="/complete" component={Complete} />

            <AdminRoute exact path="/supacolor" component={Supacolor} />

            <AdminRoute exact path="/wallyb" component={WallyB} />

            <AdminRoute exact path="/register" component={Register} />

            <AdminRoute exact path="/admin" component={Admin} />

            {/* If none of the other routes matched, we will show a 404. */}
            <Route render={() => <><br/><br/><br/><br/><br/><br/><h1 className="fourfour">404</h1></>} />
          </Switch>
          <Footer/>
        </div>
      </Router>
    );
  }



const mapStateToProps = (state) => ({
  user: state.user,
});

// this allows us to use <App /> in index.js **

export default App;
