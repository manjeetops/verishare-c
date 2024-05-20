import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Card from '@material-ui/core/Card';
import { connect } from 'react-redux';
import Tooltip from '@material-ui/core/Tooltip';

class ResourceList extends Component {
  compileHeader = () => (
    <TableHead>
      <TableRow>
        {this.props.headings.map(heading => (
          <TableCell key={heading.label}>{heading.label}</TableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  renderCell = (data, heading) => {
    if (heading.render) {
      return heading.render(data, this.props);
    }
    if (heading.format) {
      return heading.format(data[heading.key]);
    }
    return data[heading.key];
  };

  getOrganizationById(orgId) {
    let org;
    if (this.props.organizations !== null) {
      this.props.organizations.map(organization => {
        if (organization.org_id === orgId) {
          org = organization;
        }
      });
      return org.business_name;
    }
    return "";
  }

  getLabelValue(label, row) {
    if (label === "From") {
      return row.from
    }
    if (label === "To") {
      return row.to
    }
    if (label === "User") {
      return row
    }
  }

  toolTipWithData(row, heading, index) {
    const { tooltip } = this.props;

    if (tooltip && heading.label !== "Timestamp" && heading.label !== "Access") {
      return (
        <Tooltip
          placement="bottom-start"
          title={
            <div>
              <p>
                <b>email</b>:
                {this.getLabelValue(heading.label, row).email}
              </p>
              <p>
                <b>Organization</b>:
                {this.getLabelValue(heading.label, row).organizationName}
              </p>
            </div>
          }
          key={index}
        >
          <TableCell key={row[heading.key]} style={{ cursor: 'pointer' }}>
            {this.renderCell(row, heading)}
          </TableCell>
        </Tooltip>
      );
    }

    return (
      <TableCell key={row[heading.key]}>
        {this.renderCell(row, heading)}
      </TableCell>
    );
  }

  renderRow = row => {
    const { headings, getRowId } = this.props;
    return (
      <TableRow key={getRowId(row)}>
        {headings.map((heading, index) =>
          this.toolTipWithData(row, heading, index)
        )}
      </TableRow>
    );
  };

  compileBody = () => {
    const { rowData, renderRow, emptyText } = this.props;
    return (
      <TableBody>
        {!Boolean(rowData.length) && (
          <TableRow key="no content">
            <TableCell style={{ fontWeight: "bold" }}>{emptyText}</TableCell>
          </TableRow>
        )}
        {rowData.map(renderRow || this.renderRow)}
      </TableBody>
    );
  };

  render() {
    const { noHeading, cardProps } = this.props;
    return (
      <Card {...cardProps}>
        <Table>
          {!Boolean(noHeading) && this.compileHeader()}
          {this.compileBody()}
        </Table>
      </Card>
    );
  }
}

const mapStateToProps = state => {
  return ({
    organizations: state.users.organizations,
  })
};

ResourceList.defaultProps = {
  getRowId: row => row.id || row._id,
  noHeading: false,
  emptyText: 'No records found',
  cardProps: {},
};

ResourceList.propTypes = {
  noHeading: PropTypes.bool,
  cardProps: PropTypes.object,
  rowData: PropTypes.array.isRequired,
  getRowId: PropTypes.func,
  renderRow: PropTypes.func,
  emptyText: PropTypes.string,
  organizations: PropTypes.array,
  tooltip: PropTypes.bool,
  headings: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    render: PropTypes.func,
    format: PropTypes.func,
  })).isRequired,
};

export default connect(mapStateToProps, null)(ResourceList);
