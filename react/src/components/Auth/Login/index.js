import React from "react";
import { Grid, Typography, Link, Paper, Button } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import { Field, Form, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { Logo } from "../../../lib/assets";
import { loginUser } from '../../../actions/login.actions'
import { withRouter } from 'react-router';
import ReduxedTextField from '../../ReduxedTextField';
import { validate } from './validate';
import PropTypes from "prop-types"
import "./login.css";

class Login extends React.Component {

  submit = (data) => {
    const { email, password } = data;
    this.props.loginUser({
      username: email,
      password,
    })
  }

  render() {
    const { classes, handleSubmit } = this.props;

    return (
      <Grid container style={{ marginTop: 130 }}>
        <Grid item xs={4}></Grid>
        <Grid item sm={3} style={{ marginLeft: 50 }}>
          <Paper className="login-container">
            <Grid container style={{ marginTop: 5 }}>
              <Grid item xs={4}></Grid>
              <Grid item xs={4}>
                <img src={Logo} height="90" width="90" alt="logo" />
              </Grid>
            </Grid>
            <Form onSubmit={handleSubmit(this.submit)}>
              <Grid container>
                <Field
                  id='email'
                  name='email'
                  type="text"
                  label="Email"
                  margin="normal"
                  className={classes.textField}
                  component={ReduxedTextField}
                />
                <Field
                  id='password'
                  name='password'
                  type="password"
                  label="Password"
                  margin="normal"
                  className={classes.textField}
                  component={ReduxedTextField}
                />
              </Grid> <br />
              <Grid container>
                <Button
                  type="submit"
                  variant="contained"
                  className="login-button"
                >
                  Login
                </Button>
                {/* <Typography style={{ fontSize: 20 }}> <br />
                  Not a member yet?  <Link href="/signup" style={{ textDecoration: 'none' }}>Sign Up</Link>
                </Typography> */}
              </Grid>
            </Form>
          </Paper>
        </Grid>
      </Grid>
    );
  }
};

const styles = {
  root: {
    margin: '20'
  },
  textField: {
    width: '100%'
  }
};

const mapDispatchToProps = {
  loginUser,
};

const mapStateToProps = state => {
  return ({
    scan: state
  })
};

Login.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  loginUser: PropTypes.func.isRequired
};

const formed = reduxForm({ form: 'login', validate })(Login);
const connected = connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(formed));

export default withRouter(connected);
