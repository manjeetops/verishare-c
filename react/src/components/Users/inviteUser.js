import React from "react";
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from "@material-ui/core/Grid";
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Field, Form, reduxForm } from 'redux-form';
import PropTypes from "prop-types"
import ReduxedTextField from '../ReduxedTextField';
import { inviteUser, getInvites } from '../../actions/invites.actions'


class InviteUser extends React.Component {
  submit = (data) => {
    const { email, designation, name } = data;
    this.props.inviteUser({
      email,
      firstName: name,
      lastName: designation
    })
  }

  render() {
    const { classes, open, handleClose, handleSubmit } = this.props;

    return (
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Invite User</DialogTitle>
        <DialogContent>
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
            </ Grid>
            <Grid container>
              <Field
                id='designation'
                name='designation'
                type="text"
                label="Designation"
                margin="normal"
                className={classes.textField}
                component={ReduxedTextField}
              />
            </Grid>
            <Grid container>
              <Field
                id='email'
                name='email'
                type="email"
                label="Email"
                margin="normal"
                className={classes.textField}
                component={ReduxedTextField}
              />
            </Grid> <br />
            <Grid container>
              <Button
                type="submit"
                onClick={handleClose}
              >
                Submit
              </Button>
              <Button color="primary" onClick={handleClose}>
                Cancel
              </Button>
            </Grid>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
}


const styles = {
  card: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  }
};

InviteUser.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  inviteUser: PropTypes.func.isRequired
};

const mapDispatchToProps = {
  inviteUser,
  getInvites
};

const mapStateToProps = state => {
  return ({
    scan: state
  })
};

const formed = reduxForm({ form: 'invite' })(InviteUser);
const connected = connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(formed));

export default connected
