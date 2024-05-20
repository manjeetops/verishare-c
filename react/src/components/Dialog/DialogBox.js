import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DialogBox = ({
  open,
  title,
  children,
  toggleDialog,
}) => (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={toggleDialog}
    >
      {Boolean(title) && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>
        {children}
      </DialogContent>
    </Dialog>
  );

DialogBox.propTypes = {
  title: PropTypes.string,
  open: PropTypes.bool,
  children: PropTypes.element,
  toggleDialog: PropTypes.func.isRequired,
};

export default DialogBox;
