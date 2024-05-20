import React from 'react';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import FileCopy from '@material-ui/icons/FileCopy';

const CopyToClipboardButton = props => (
  <CopyToClipboard {...props}>
    <FileCopy style={{  cursor: 'pointer' }} />
  </CopyToClipboard>
);

CopyToClipboardButton.propTypes = {
  text: PropTypes.string.isRequired,
};

export default CopyToClipboardButton;
