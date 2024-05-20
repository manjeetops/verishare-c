import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';

const PageWrapper = ({ cardProps = {}, ...props }) => (
  <Card {...cardProps}>
    <Box p={3} {...props} />
  </Card>
);

PageWrapper.propTypes = {
  cardProps: PropTypes.object,
};

export default PageWrapper;
