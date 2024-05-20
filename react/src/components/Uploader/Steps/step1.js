import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import documentUpload from "../../../lib/assets/images/document-upload.png";
import { withRouter } from "react-router";
import Button from "@material-ui/core/Button";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import PropTypes from "prop-types";

class Step1 extends React.Component {
  handleSelctedFile = () => {
    this.props.callback(this.fileInput.files[0]);
  }

  render() {
    const { classes } = this.props;
    return (
      <>
        <Typography variant="h5" component="h2" align="center">
          Upload Document
        </Typography>
        <br />
        <div className="drop-zone">
          <Typography
            className={classes.pos}
            color="textSecondary"
            align="center"
          >
            select a file.
          </Typography>
          <div
            className="content-image"
            style={{
              display: "flex",
              justifyContent: "center"
            }}
            onClick={() => this.fileInput.click()}
          >
            <img
              src={documentUpload}
              height="250"
              width="250"
              alt="logo"
              style={{ cursor: "pointer" }}
            />
          </div>
          <br />
          <Button
            variant="contained"
            color="primary"
            style={{ width: "100%" }}
            size="small"
            endIcon={<CloudUploadIcon />}
            onClick={() => this.fileInput.click()}
          >
            Select File
          </Button>
          <input
            type="file"
            name="file"
            className="select-file"
            ref={ref => (this.fileInput = ref)}
            style={{ display: "none" }}
            onChange={this.handleSelctedFile}
          />
        </div>
      </>
    );
  }
}

Step1.propTypes = {
  classes: PropTypes.object.isRequired,
  callback: PropTypes.func.isRequired
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

export default withRouter(withStyles(styles)(Step1));
