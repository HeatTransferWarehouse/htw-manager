import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter as Router } from "react-router-dom";
import { createStore, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import createSagaMiddleware from "redux-saga";
import logger from "redux-logger";
import rootReducer from "./redux/reducers";
import rootSaga from "./redux/sagas";
import App from "./components/App/App";
import { BreakpointsProvider } from "./context/BreakpointsContext";
import { DropDownManagerProvider } from "./context/dropdownContext";

const sagaMiddleware = createSagaMiddleware();

const middlewareList =
  process.env.NODE_ENV === "development"
    ? [sagaMiddleware, logger]
    : [sagaMiddleware];

const composeEnhancers =
  process.env.NODE_ENV === "development" &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(...middlewareList))
);

sagaMiddleware.run(rootSaga);

const container = document.getElementById("react-root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BreakpointsProvider>
        <DropDownManagerProvider>
          {" "}
          {/* Wrap Dropdown Manager */}
          <Router>
            <App />
          </Router>
        </DropDownManagerProvider>
      </BreakpointsProvider>
    </Provider>
  </React.StrictMode>
);
