import React from "react";
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import qs from 'query-string';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';


class ShareDocument extends React.Component {
  handleDocumentChange = (event) => {
    event.preventDefault()
    this.props.history.push(`/users?${qs.stringify({
      ...this.getSearchParams(),
      doc: event.target.value,
    })}`);
  }

  handleScopeChange = (event) => {
    event.preventDefault()
    this.props.history.push(`/users?${qs.stringify({
      ...this.getSearchParams(),
      type: event.target.value,
    })}`);
  }


  getSearchParams = () => qs.parse(this.props.location.search);

  render() {
    const { classes, handleShareDoc, open, handleClose, user, documents } = this.props;
    const { doc = '' } = this.getSearchParams();

    return (
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Transfer Document</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select document to transfer to {user.firstName}&nbsp;({user.lastName})
            </DialogContentText>
          <FormControl className={classes.formControl} style={{ minWidth: 200 }}>
            <InputLabel id="demo-simple-select-label">Document</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={doc}
              onChange={this.handleDocumentChange}
            >
              {
                (documents || []).map(document => (
                  <MenuItem key={document.documentId} value={document.documentId}>{document.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl> <br /><br />
          <FormControl className={classes.formControl} style={{ minWidth: 200 }}>
            <InputLabel id="demo-simple-select-label">Access Scope</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              onChange={this.handleScopeChange}
            >
              <MenuItem value='view'> View</MenuItem>
              <MenuItem value='edit'> Edit</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleClose}>
            Cancel
            </Button>
          <Button
            color="primary"
            onClick={handleShareDoc}>
            Share
            </Button>
        </DialogActions>
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

export default withStyles(styles)(ShareDocument);
