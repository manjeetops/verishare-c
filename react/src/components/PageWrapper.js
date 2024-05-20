import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';

const PageWrapper = props => <Box marginTop={props.printMode ? 0 : 8} {...props} />;

PageWrapper.propTypes = {
  printMode: PropTypes.bool,
};

export default PageWrapper;
