import React from 'react';
import noop from 'lodash/noop';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';

const LoaderDialog = ({ open, title, onClose }) => (
  <Dialog
    open={open}
    onClose={onClose}
    fullWidth
    disableBackdropClick
    disableEscapeKeyDown
  >
    <DialogTitle>
      {title}
    </DialogTitle>
    <DialogContent style={{ textAlign: 'center' }}>
      <CircularProgress />
    </DialogContent>
    <DialogActions />
  </Dialog>
);

LoaderDialog.propTypes = {
  title: PropTypes.string,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

LoaderDialog.defaultProps = {
  title: 'Processing . . . Please wait!',
  open: false,
  onClose: noop,
};

export default LoaderDialog;
