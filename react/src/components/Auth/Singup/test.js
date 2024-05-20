import React from "react";
import { Grid, Typography, Link, Paper, Button } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import { Field, Form, reduxForm } from 'redux-form';
import qs from "query-string";
import { connect } from 'react-redux';
import { Logo } from "../../../lib/assets";
import { loginUser } from '../../../actions/login.actions'
import { withRouter } from 'react-router';
import ReduxedTextField from '../../ReduxedTextField';
import { validate } from './validate';
import PropTypes from "prop-types"
import "./signup.css";

class Signup extends React.Component {

  getSearchParams = () => qs.parse(this.props.location.search);

  submit = (data) => {
    const { email, password } = data;
    // this.props.loginUser({
    //   username: email,
    //   password,
    // })
  }

  render() {
    const { classes, handleSubmit } = this.props;

    return (
      <Grid container style={{ marginTop: 130 }}>
        <Grid item xs={4}></Grid>
        <Grid item sm={3} style={{ marginLeft: 50 }}>
          <Paper className="signup-container">
            <Grid container style={{ marginTop: 5 }}>
              <Grid item xs={4}></Grid>
              <Grid item xs={4}>
                <img src={Logo} height="90" width="90" alt="logo" />
              </Grid>
            </Grid>
            <Form onSubmit={handleSubmit(this.submit)}>
              <Grid container>
                <Field
                  id='name'
                  name='name'
                  type="text"
                  label="Name"
                  margin="normal"
                  className={classes.textField}
                  component={ReduxedTextField}
                />
                <Field
                  id='designation'
                  name='designation'
                  type="text"
                  label="Designation"
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
                <Field
                  id='confirmPassword'
                  name='confirmPassword'
                  type="password"
                  label="Confirm Password"
                  margin="normal"
                  className={classes.textField}
                  component={ReduxedTextField}
                />
                <Field
                  id='invitationCode'
                  name='invitationCode'
                  type="text"
                  label="Invitation Code"
                  margin="normal"
                  className={classes.textField}
                  component={ReduxedTextField}
                />
              </Grid> <br />
              <Grid container>
                <Button
                  type="submit"
                  variant="contained"
                  className="signup-button"
                >
                  Register
                </Button>
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

Signup.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  loginUser: PropTypes.func.isRequired
};

const formed = reduxForm({ form: 'signup', validate })(Signup);
const connected = connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(formed));

export default withRouter(connected);
