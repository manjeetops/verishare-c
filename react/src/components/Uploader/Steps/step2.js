import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { withRouter } from "react-router";
import Button from "@material-ui/core/Button";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import PropTypes from "prop-types";
import uuidv4 from 'uuid/v4'
import ReduxedTextField from "../../ReduxedTextField";
import { Field, Form, reduxForm } from "redux-form";
import { validate } from "../validate";

class Step2 extends React.Component {
  componentDidMount() {
    this.props.initialize({ document: this.props.file });
  }

  submit = data => {
    const { document, description, name } = data;
    const userId = localStorage.getItem("USER_ID");
    const fileFields = {
      document,
      name,
      description,
      frozen: false,
      url: `https://storage.googleapis.com/document-sharing-app/${uuidv4()}`
    };

    const formdata = new FormData();
    Object.entries(fileFields).forEach(([key, value]) => {
      formdata.append(key, value);
    });

    this.props.onSubmit(userId, formdata);
  };

  render() {
    const { classes, handleSubmit } = this.props;
    return (
      <>
        <Typography variant="h5" component="h2" align="center">
          Uploader
          <IconButton style={{ float: 'right' }} onClick={() => this.props.handleCancel()}>
            <CloseIcon />
          </IconButton>
        </Typography>
        <br />
        <div className="drop-zone">
          <Form onSubmit={handleSubmit(this.submit)}>
            <div
              className="content-image"
              style={{
                display: "grid",
                justifyContent: "center"
              }}
            >
              <Field
                id="document"
                name="document"
                type="text"
                label="Document"
                format={document => (document && document.name) || ''}
                margin="normal"
                className={classes.textField}
                component={ReduxedTextField}
                disabled
              />
              <Field
                id="name"
                name="name"
                type="text"
                label="Name"
                margin="normal"
                className={classes.textField}
                component={ReduxedTextField}
              />
              <Field
                id="description"
                name="description"
                type="text"
                label="Description"
                margin="normal"
                className={classes.textField}
                component={ReduxedTextField}
              />
            </div>
            <br />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              style={{ width: "100%" }}
              size="small"
              endIcon={<CloudUploadIcon />}
            >
              Upload Data
            </Button>
          </Form>
        </div>
      </>
    );
  }
}

Step2.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  file: PropTypes.object.isRequired,
  initialize: PropTypes.func.isRequired
};

const styles = {
  card: {
    minWidth: 275,
    marginLeft: 20
  },
  pos: {
    marginBottom: 12
  }
};

const formed = reduxForm({
  form: "upload",
  validate,
})(withStyles(styles)(Step2));

export default withRouter(formed);
