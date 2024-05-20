import React from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
  TablePagination,
  Tooltip
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import dayjs from 'dayjs';
import Certified from "../../lib/assets/images/verified.jpeg"

const AllOrgDocuments = props => {
  const { classes } = props;
  let list = props.allOrgDocuments;

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectRow = (docId) => {
    props.history.push(`/doc/${docId}`);
  };

  const tableCell = () => {
    if (list && list.length !== 0) {
      return list
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map(row => (
          <TableRow
            style={{cursor: 'pointer'}}
            hover
            key={row.documentId}
            onClick={() => handleSelectRow(row.documentId)}
          >
            <TableCell align="center">
              {row.name}
            </TableCell>
            <TableCell align="center">{row.version}</TableCell>
            <TableCell align="center">{row.versions[0].sha256.toLowerCase()}</TableCell>
            <TableCell align="center">{row.createdAt}</TableCell>
          </TableRow>
        ));
    }

    return (
      <TableRow key="no content">
        <TableCell>No Content</TableCell>
      </TableRow>
    )
  }

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6" component="h2" align="center">
          All Organization Documents
        </Typography>
        <br />
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow key="heading">
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">Latest Version</TableCell>
              <TableCell align="center">Hash</TableCell>
              <TableCell align="center">Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="table">
            {tableCell()}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={list ? list.length : 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </CardContent>
    </Card>
  );
};

AllOrgDocuments.propTypes = {
  classes: PropTypes.object,
  allOrgDocuments: PropTypes.array,
  history: PropTypes.object
};

const styles = {
  card: {
    minWidth: 964
  },
  font: {
    fontSize: 14
  }
};

export default withRouter(withStyles(styles)(AllOrgDocuments));
