import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import Step1 from "./Steps/step1";
import Step2 from "./Steps/step2";

class Uploader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null
    };
  }

  handleNext = fileName => {
    this.setState({ file: fileName });
  };

  cancelUpload = () => {
    this.setState({ file: null });
  }

  uploadFile = (userId, file) => {
    this.props.postUploadedFile(userId, file)
    this.setState({ file: null });
  }

  render() {
    const { classes } = this.props;

    return (
      <Card className={classes.card} id="uploader-section">
        <CardContent>
          {this.state.file === null ? (
            <Step1 callback={this.handleNext} />
          ) : (
            <Step2 file={this.state.file} onSubmit={this.uploadFile} handleCancel={this.cancelUpload}/>
          )}
        </CardContent>
      </Card>
    );
  }
}

Uploader.propTypes = {
  classes: PropTypes.object.isRequired,
  postUploadedFile: PropTypes.func.isRequired,
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

export default withRouter(withStyles(styles)(Uploader));
