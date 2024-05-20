import React from "react";
import { Grid } from "@material-ui/core";
import qs from "query-string";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import { connect } from "react-redux";
import { getOrganizations } from "../../actions/users.actions";
import ShareDocument from "./shareDocument";
import TransferDocument from "./transferDocument";

import { getDocumentList } from "../../actions/documentList.actions";
import { transferDocument, shareDocumentAccess } from "../../actions/transferDocument.actions";
import Invitations from './invitations'

const getUserId = () => localStorage.getItem("USER_ID");
const getUserRole = () => localStorage.getItem("USER_ROLE");

class Users extends React.Component {
  componentDidMount() {
    this.props.getDocumentList(getUserId());
    this.props.getOrganizations();
  }

  handleShareClick = id => {
    this.props.history.push(
      `/users?${qs.stringify({
        ...this.getSearchParams(),
        activeSharePopup: id
      })}`
    );
  };

  handleShareClose = () => {
    const searchParams = { ...this.getSearchParams() };
    delete searchParams.activeSharePopup;
    // delete searchParams.doc;
    delete searchParams.type;
    this.props.history.push(`/users?${qs.stringify(searchParams)}`);
  };


  handleTransferClose = () => {
    const searchParams = { ...this.getSearchParams() };
    delete searchParams.activeTransferPopup;
    // delete searchParams.doc;
    this.props.history.push(`/users?${qs.stringify(searchParams)}`);
  };

  handleTransferClick = id => {
    this.props.history.push(
      `/users?${qs.stringify({
        ...this.getSearchParams(),
        activeTransferPopup: id
      })}`
    );
  };

  getSearchParams = () => qs.parse(this.props.location.search);

  handleShareDoc = (receiverId, accessScope) => {
    const { doc, type } = this.getSearchParams();
    this.props.shareDocumentAccess(getUserId(), doc, receiverId, type, accessScope);
    this.handleShareClose()
  };

  handleTransferDoc = (receiverId) => {
    const { doc } = this.getSearchParams();
    this.props.transferDocument(getUserId(), doc, receiverId);
    this.handleTransferClose()
  };

  isAdminOfUser = (user) => {
    const currentUserInfo = this.props.userInfo
    return currentUserInfo.organizationId === user.organizationId
      && user.role === "ADMIN"
  }

  render() {
    const { classes, location, history, organizations } = this.props;
    const { activeSharePopup, activeTransferPopup } = this.getSearchParams();
    if (!this.props.usersFetched || !this.props.documentsFetched) {
      return null;
    }

    return (
      <Grid container style={{ marginTop: 130 }}>
        <Grid item xs={1}></Grid>
        <Grid item sm={10}>
          <Typography variant="h5" component="h2" align="center">
            Users
              </Typography>{" "}
          <br />
          <div className={classes.root} style={{ boxShadow: "0 10px 20px rgba(0,0,0,0.16" }}>
            {(organizations || []).map(organization => (
              <ExpansionPanel key={organization.id}>
                <ExpansionPanelSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.heading}>
                    {organization.businessName}
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <TableContainer component={Paper}>
                    <Table
                      className={classes.table}
                      size="small"
                      aria-label="a dense table"
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell
                            align="left"
                            style={{ fontWeight: "bold" }}
                          >
                            Name
                              </TableCell>
                          <TableCell
                            align="left"
                            style={{ fontWeight: "bold" }}
                          >
                            Email
                              </TableCell>
                          <TableCell
                            align="left"
                            style={{ fontWeight: "bold" }}
                          >
                            Created
                              </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(organization.users || []).map(user => (
                          user.role !== "SERVICE" &&
                          <TableRow key={user.id}>
                            <TableCell align="left">
                              {`${user.firstName} (${user.lastName})`}
                            </TableCell>
                            <TableCell align="left">{user.email}</TableCell>
                            <TableCell align="left">
                              {user.createdAt}
                            </TableCell>
                            {user.id !== getUserId() && (
                              <TableCell>
                                <Button
                                  size="small"
                                  color="primary"
                                  onClick={() =>
                                    this.handleTransferClick(user.id)
                                  }
                                >
                                  transfer document
                                  </Button>
                              </TableCell>
                            )}
                            {(user.id !== getUserId() && !this.isAdminOfUser(user)) && (
                              <TableCell>
                                <Button
                                  size="small"
                                  color="primary"
                                  onClick={() =>
                                    this.handleShareClick(user.id)
                                  }
                                >
                                  share document
                                  </Button>
                              </TableCell>
                            )}
                            <ShareDocument
                              open={activeSharePopup === user.id}
                              handleClose={this.handleShareClose}
                              user={user}
                              location={location}
                              organizations={organizations}
                              history={history}
                              documents={this.props.documents}
                              handleShareDoc={() =>
                                this.handleShareDoc(user.id, 'user')
                              }
                            />
                            <TransferDocument
                              open={activeTransferPopup === user.id}
                              handleClose={this.handleTransferClose}
                              user={user}
                              location={location}
                              organizations={organizations}
                              history={history}
                              documents={this.props.documents}
                              handleTransferDoc={() =>
                                this.handleTransferDoc(user.id)
                              }
                            />
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            ))}
          </div>
        </Grid>
        {(getUserRole() === "ADMIN") &&
          <Invitations />}
      </Grid>
    );
  }
}

const styles = {
  card: {
    minWidth: 275
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  }
};

const mapDispatchToProps = {
  getOrganizations,
  getDocumentList,
  transferDocument,
  shareDocumentAccess
};

const mapStateToProps = state => {
  return {
    organizations: state.users.organizations,
    usersFetched: state.users.isSuccess,
    documents: state.documentList.document_info,
    documentsFetched: state.documentList.isSuccess,
    userInfo: state.login.user_info,
  };
};

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Users));

export default connected;
