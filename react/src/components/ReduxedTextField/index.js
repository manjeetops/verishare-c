import React from 'react';
import { TextField } from '@material-ui/core';

const ReduxedTextField = ({ input, meta: { touched, error }, ...others }) => (
  <TextField {...input} {...others} error={touched && !!error} helperText={touched && error} />
);

export default ReduxedTextField;
