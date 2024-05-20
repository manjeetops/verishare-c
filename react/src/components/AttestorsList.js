import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import qs from 'query-string';
import DialogBox from './Dialog/DialogBox';
import ResourceList from './ResourceList';


const headings = [
  {
    key: 'firstName',
    label: 'Attestor'
  },
  {
    key: 'lastName',
    label: 'Designation'
  },
  {
    key: 'organizationName',
    label: 'Organization',
  },
  {
    key: 'timeStamp',
    label: 'Timestamp',
  },
];


const getAttestors = (versions, params) => {
  const version = qs.parse(params).attestors

  if (version) {
    const fetchedVersion = versions.filter(v => {
      return v.version === parseInt(version)
    })

    return fetchedVersion[0].attestations
  }
  return []
}

const AttestorsList = ({ versions, ...props }) => {
  const params = props.location.search
  const attestors = getAttestors(versions, params)
  return (
    <DialogBox title="Attestors" {...props}>
      <ResourceList
        headings={headings}
        rowData={attestors}
      />
    </DialogBox>
  );
}

AttestorsList.propTypes = {
  users: PropTypes.array,
  open: PropTypes.bool,
};

AttestorsList.defaultProps = {
  users: [],
};

export default AttestorsList
