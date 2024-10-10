import React from "react";
import { Navigate } from "react-router-dom";
import { connect } from "react-redux";

const AdminRoute = ({ element: ComponentToProtect, user, ...otherProps }) => {
  if (user.id && user.access_level > 1) {
    // User is logged in and is an admin, show the protected component
    return ComponentToProtect;
  } else {
    // If the user is not an admin, redirect to the login page
    return <Navigate to="/login" />;
  }
};

const mapStateToProps = (state) => ({
  user: state.user.userReducer,
});

export default connect(mapStateToProps)(AdminRoute);
