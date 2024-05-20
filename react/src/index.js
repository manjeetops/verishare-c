import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import App from './App';
import { configureStore, history } from './store/configureStore';
import runSaga from './sagas';
import { ConnectedRouter } from 'connected-react-router';

// TODO: this should be in config file (do this in one file only)
const store = configureStore();
runSaga();

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById("root")
);
