import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';


const DocDetailItem = ({ title, description, ...props }) => (
  <Box marginBottom={2} {...props}>
    <b>{title}</b><br />
    <span>{description}</span>
  </Box>
);

DocDetailItem.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.any.isRequired,
};

export default DocDetailItem;
