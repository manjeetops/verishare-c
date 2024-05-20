import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { withRouter } from 'react-router-dom';
import { connect } from "react-redux";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import Router from "./routes";
import Header from "./components/Header";
import LoaderDialog from "./components/Dialog/LoaderDialog";
import Snackbar from "./components/Notifications/Snackbar";
import { hideNotification } from "./actions/app.actions";

// https:/material.io/color
const theme = createMuiTheme({
  typography: {
    fontFamily: "sans-serif",
    htmlFontSize: 16
  },
  palette: {
    background: { default: "#F8F7FE" },
    primary: {
      main: "#0000ff"
    },
    secondary: {
      main: "#0000ff"
    }
  },
  overrides: {
    MUIDataTableBodyCell: {
      root: {
        paddingTop: 5,
        paddingBottom: 5
      }
    }
  }
});

class App extends React.Component {
  render() {
    const { hideNotification, notification, loader, printMode } = this.props;
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {!printMode && <Header {...this.props} />}
        <Router />
        <Snackbar handleClose={hideNotification} {...notification} />
        <LoaderDialog {...loader} />
      </MuiThemeProvider>
    );
  }
}

const reduxConnected = connect(
  state => ({
    notification: state.app.notification,
    printMode: state.router.location.query.print === 'true',
    loader: state.app.loader,
  }),
  {
    hideNotification
  }
)(App);

export default withRouter(reduxConnected);
