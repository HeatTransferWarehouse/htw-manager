import React from "react";
import { Route } from "react-router-dom";
import { connect } from "react-redux";
import LoginPage from "../LoginPage/LoginPage";

const ProtectedRoute = (props) => {
  const {
    component: ComponentToProtect,
    user,
    loginMode,
    ...otherProps
  } = props;

  let ComponentToShow;

  if (user.id) {
    // User is logged in, show the protected component
    ComponentToShow = ComponentToProtect;
  } else if (loginMode === "login") {
    // User is not logged in, show the LoginPage
    ComponentToShow = LoginPage;
  } else {
    // Default to showing LoginPage
    ComponentToShow = LoginPage;
  }

  return (
    <Route
      {...otherProps}
      render={(routeProps) => {
        // Extract the dynamic part of the URL (e.g., someId)
        const id = routeProps.match.params.id;

        // Create a dynamic ID based on the extracted value
        const dynamicId = `promotions/${id}`;

        // Pass the dynamic ID to the component
        return (
          <ComponentToShow {...routeProps} {...otherProps} id={dynamicId} />
        );
      }}
    />
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user.userReducer,
    loginMode: state.loginMode,
  };
};

export default connect(mapStateToProps)(ProtectedRoute);
