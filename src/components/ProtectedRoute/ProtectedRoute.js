import React from "react";
import { Navigate } from "react-router-dom";
import { connect } from "react-redux";

const ProtectedRoute = ({
  element: ComponentToProtect,
  user,
  ...otherProps
}) => {
  if (user.id) {
    // User is logged in, show the protected component
    return ComponentToProtect;
  } else {
    // If the user is not logged in, redirect to the login page
    return <Navigate to="/login" />;
  }
};

const mapStateToProps = (state) => ({
  user: state.user.userReducer,
});

export default connect(mapStateToProps)(ProtectedRoute);
