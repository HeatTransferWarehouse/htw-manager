import React from "react";
import { createRoot } from "react-dom/client";
import { createStore, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import createSagaMiddleware from "redux-saga";
import logger from "redux-logger";
import { BreakpointsProvider } from "./context/BreakpointsContext";

import rootReducer from "./redux/reducers"; // imports ./redux/reducers/index.js
import rootSaga from "./redux/sagas"; // imports ./redux/sagas/index.js

import App from "./components/App/App";

// Create saga middleware
const sagaMiddleware = createSagaMiddleware();

const middlewareList =
  process.env.NODE_ENV === "development"
    ? [sagaMiddleware, logger]
    : [sagaMiddleware];

const store = createStore(
  rootReducer,
  compose(applyMiddleware(...middlewareList))
);

// Run the rootSaga
sagaMiddleware.run(rootSaga);

// Get the root element where the React app will be rendered
const container = document.getElementById("react-root");

// Create a root and render the app
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <BreakpointsProvider>
      <App />
    </BreakpointsProvider>
  </Provider>
);
