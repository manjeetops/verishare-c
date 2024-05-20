import React from 'react';
import { connect } from 'react-redux';
import qs from 'query-string';
import dayjs from 'dayjs';
import QRCode from 'qrcode.react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import withstyles from '@material-ui/styles/withStyles';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import GetAppIcon from '@material-ui/icons/GetApp';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import PrintIcon from '@material-ui/icons/Print';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import SendIcon from '@material-ui/icons/Send';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { withRouter } from 'react-router';
import axios from "axios"
import { getDocDetails, attestDocument, startVersionUpdate, freezeDocument } from '../actions/doc.actions';
import PageWrapper from '../components/PageWrapper';
import GridItem from '../components/mui/GridItem';
import GridContainer from '../components/mui/GridContainer';
import PaddedCard from '../components/PaddedCard';
import DocDetailItem from '../components/DocDetailItem';
import ResourceList from '../components/ResourceList';
import CopyToClipboard from '../components/CopyToClipboard';
import UploadDoc from '../components/UploadDoc';
import AttestorsList from '../components/AttestorsList';
import { Logo } from '../lib/assets';
import { showNotification } from '../actions/app.actions';
import { getOrganizations } from '../actions/users.actions';
import { deleteDocument } from '../actions/doc.actions';
import config from "../config";

const certTitle = 'Blockchain digital stamping certificate';
const certDescription = 'The electronic document accompanying this certicate has been digitally stamped by emmbedding it\'s SHA256 within the blockchain public ledger maintained and in the decentralized network.';
const blocktimeCaption = '* The time shown in the blockhain may slightly vary subject to network confirmations';

const styles = theme => ({
  mainDetailsBlock: {
    marginBottom: theme.spacing(3),
  },
  logo: {
    width: 90,
    height: 90,
  },
  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
  },
  textPrimary: {
    color: '#ff530d',
  },
  sectionHeader: {
    marginBottom: theme.spacing(2),
  },
  shaHash: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  flexEnd: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  actionButton: {
    margin: theme.spacing(0, 0.5),
    borderRadius: theme.spacing(1.5),
  },
  fullHeight: {
    height: '100%',
  },
  verticalAlignment: {
    display: 'inline-block',
    verticalAlign: 'middle',
    lineHeight: 'normal',
    marginLeft: '10px'
  }
});

const versionHeadings = [
  {
    key: 'version',
    label: 'Version',
  },
  {
    key: 'attestations',
    label: 'Certified',
    format: attestations => attestations && attestations.length ? 'Yes' : 'No',
  },
  {
    key: 'attestations',
    label: 'Attestors',
    render: ({ version }, props) => (
      props.printMode
        ? null
        : <Button
          color="primary"
          variant="contained"
          size="small"
          onClick={() => props.handleShowAttestors(version)}
        >
          View Attestors
        </Button>
    )
  },
];

const transferHeadings = [
  {
    key: 'from',
    label: 'From',
    format: from => from ?
      `${from.firstName}` : '-',
  },
  {
    key: 'to',
    label: 'To',
    format: to => to ?
      `${to.firstName}` : '-',
  },
  {
    key: 'timestamp',
    label: 'Timestamp',
    format: timestamp => dayjs(timestamp).format('YYYY-MM-DD | HH:mm:ss')
  },
];

const permissionHeadings = [
  {
    key: 'firstName',
    label: 'User',
  },
  {
    key: 'accessType',
    label: 'Access',
  },
  {
    key: 'timestamp',
    label: 'Timestamp',
    format: timestamp => dayjs(timestamp).format('YYYY-MM-DD | HH:mm:ss')
  },
];

class DocDetails extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null
    };
  }

  componentDidMount() {
    const { match, getDocDetails, userLoading, userInfo } = this.props;
    if (!userInfo || userLoading) {
      this.fetchLater();
    } else {
      getDocDetails(this.props.userInfo.id, match.params.id);
    }
    // de2c15f8-2ef7-4e8c-bf60-7c34446965cb
  }

  fetchLater() {
    setTimeout(() => {
      const { match, getDocDetails, userLoading, userInfo } = this.props;
      if (!userInfo || userLoading) {
        this.fetchLater();
      } else {
        getDocDetails(userInfo.id, match.params.id);
      }
    }, 500);
  }

  handleTransferOwner = () => {
    this.handleMenuClose()
    const { history, doc, showNotification } = this.props;
    history.push(`/users?${qs.stringify({ doc: doc.id })}`);
    showNotification('Please select a user to transfer/share document', { variant: 'info' });
  };

  handleShowAttestors = (attestors) => {
    const { history, match } = this.props;
    history.push(`/doc/${match.params.id}?${qs.stringify({ attestors })}`);
  };

  showCopySuccess = () => {
    this.props.showNotification('Copied to clipboard!');
  };

  toggleVersionDialog = () => {
    this.handleMenuClose()
    const { history, match } = this.props;
    const { versionModal } = this.getSearchParams();
    const querystring = qs.stringify({
      versionModal: !JSON.parse(versionModal || false),
    });

    history.push(`/doc/${match.params.id}?${querystring}`);
  };

  toggleAttestorsDialog = () => {
    const { history, match } = this.props;
    history.push(`/doc/${match.params.id}`);
  };

  handleAuthenticate = () => {
    this.handleMenuClose()
    const { doc, attestDocument } = this.props;
    attestDocument(doc.id, doc.versions.length);
  };

  handleGenerateCertificate = () => {
    this.handleMenuClose()
    const { match } = this.props;
    window.open(`/doc/${match.params.id}?print=true`, '_blank');
  };

  handleDownload = async () => {
    this.handleMenuClose()
    const { doc } = this.props;
    const userId = localStorage.getItem("USER_ID")
    const accessToken = localStorage.getItem("ACCESS_TOKEN")
    const docId = doc.id
    const baseUrl = config.get('server.baseUrl')
    const method = 'GET';
    const url = `${baseUrl}api/v1/users/${userId}/documents/${docId}/download`;

    axios.request({
      url,
      method,
      headers: { 'Authorization': `Bearer ${accessToken}` },
      responseType: 'blob'

    })
      .then(({ data }) => {
        const downloadUrl = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a')
        link.href = downloadUrl;
        link.setAttribute('download', `${doc.name}.zip`); //any other extension
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
  };

  handleVersionUpdate = file => {
    this.props.startVersionUpdate(
      this.props.match.params.id,
      file,
    );
  };

  handleFrozenStatusChange = () => {
    this.props.freezeDocument(
      this.props.doc.id,
      !this.props.doc.frozen,
    );
  };

  handleDocumentDelete = () => {
    this.handleMenuClose()
    this.props.deleteDocument(
      this.props.userInfo.id,
      this.props.doc.id,
    );
  };

  handleMenuClick = (event) => {
    this.setState({
      anchorEl: event.currentTarget
    })
  }

  handleMenuClose = () => {
    this.setState({
      anchorEl: null
    })
  }

  isDocumentOwnerAdmin = () => {
    const userInfo = this.props.userInfo
    const doc = this.props.doc
    const currentOwner = doc.ownershipHistory[doc.ownershipHistory.length - 1]
    return (userInfo.organizationId === currentOwner.organizationId && userInfo.role === 'ADMIN')
  }

  isDocumentFrozen = () => {
    return (!this.isDocumentOwnerAdmin() && this.props.doc.frozen)
  }

  isDocumentOwner = () => {
    const userId = localStorage.getItem("USER_ID");
    const doc = this.props.doc
    return (userId === doc.ownerId) || this.isDocumentOwnerAdmin()
  }

  hasEditAccess = () => {
    const userId = localStorage.getItem("USER_ID");
    const doc = this.props.doc
    if (this.isDocumentOwner()) {
      return true
    }

    const permission = doc.permissions.filter(p => {
      return p.userId === userId
    })

    return (permission[0] && permission[0].accessType === "EDIT")
  }

  getSearchParams = () => qs.parse(this.props.location.search);

  getTransferHistory = ownershipHistory => {
    const length = ownershipHistory.length
    let transferHistory = []
    for (let i = 0; i < length - 1; i++) {
      transferHistory.push({
        from: ownershipHistory[i],
        to: ownershipHistory[i + 1]
      })
    }

    return transferHistory
  }

  render() {
    const { doc, classes, printMode } = this.props;
    const { versionModal, attestors } = this.getSearchParams();
    if (!doc) {
      return null;
    }

    const currentVersion = doc.versions[doc.versions.length - 1];

    const transferHistory = this.getTransferHistory(doc.ownershipHistory)

    return (
      <PageWrapper paddingX={printMode ? 0 : 5} paddingY={printMode ? 0 : 3} printMode={printMode}>
        <GridContainer>
          <GridItem md={5}>
            <Typography variant="h5">
              <span>{doc.name}</span>
              <span className={classes.verticalAlignment}>
                <Tooltip title={this.props.doc.frozen ? "Frozen" : "Unfrozen"}>
                  {this.props.doc.frozen ? <LockIcon fontSize="large" /> : <LockOpenIcon fontSize="large" />}
                </Tooltip>
              </span>
            </Typography>
          </GridItem>
          {!printMode && <GridItem md={7} className={classes.flexEnd}>
            <Button aria-controls="simple-menu"
              aria-haspopup="true"
              variant="contained"
              color="primary"
              onClick={this.handleMenuClick}>
              <b>Actions</b> <ExpandMoreIcon />
            </Button>
            <Menu
              id="simple-menu"
              anchorEl={this.state.anchorEl}
              keepMounted
              open={Boolean(this.state.anchorEl)}
              onClose={this.handleMenuClose}
            >
              <MenuItem
                onClick={this.handleDownload}
              >
                <GetAppIcon style={{marginRight: 20}}/> Download
              </MenuItem>
              <MenuItem
                onClick={this.handleAuthenticate}
                disabled={this.isDocumentFrozen()}
              >
                <VerifiedUserIcon style={{marginRight: 20}}/> Attest
              </MenuItem>
              <MenuItem
                onClick={this.handleGenerateCertificate}
              >
                <PrintIcon style={{marginRight: 20}}/> Generate Certificate
              </MenuItem>
              <MenuItem
                onClick={this.toggleVersionDialog}
                disabled={this.isDocumentFrozen() || !this.hasEditAccess()}
              >
                <ArrowUpwardIcon style={{marginRight: 20}}/> Update Version
              </MenuItem>
              <MenuItem
                onClick={this.handleTransferOwner}
                disabled={this.isDocumentFrozen() || !this.isDocumentOwner()}
              >
                <SendIcon style={{marginRight: 20}}/> Share/Transfer Document
              </MenuItem>
              <MenuItem
                disabled={this.isDocumentFrozen() || !this.isDocumentOwner()}
                onClick={this.handleDocumentDelete}
              >
                <DeleteIcon style={{marginRight: 20}}/> Delete Document
              </MenuItem>
            </Menu>
          </GridItem>}
        </GridContainer>
        <Box p={2}>
          <PaddedCard cardProps={{ raised: true }}>
            {this.isDocumentOwnerAdmin() &&
              <FormControlLabel
                control={
                  <Switch
                    checked={this.props.doc.frozen}
                    onChange={this.handleFrozenStatusChange}
                  />
                }
                label="Freeze"
                style={{ float: "right" }}
              />}
            <GridContainer spacing={2} direction={printMode ? 'column' : 'row'}>
              <GridItem md={7}>
                <GridContainer>
                  <GridItem md={2} className={classes.flexCenter}>
                    <img src={Logo} className={classes.logo} alt="logo" />
                  </GridItem>
                  <GridItem md={10}>
                    <br />
                    <div className={classes.mainDetailsBlock}>
                      <Typography variant="body1"><b>{certTitle}</b></Typography>
                      <Typography variant="caption">{certDescription}</Typography>
                    </div>
                    <div className={classes.mainDetailsBlock}>
                      <b>Document blockhain timestamp</b><br />
                      <div className={classes.textPrimary}>
                        {dayjs(doc.updatedAt).format('YYYY-MM-DD | HH:mm:ss')}
                      </div>
                      <small>{blocktimeCaption}</small>
                    </div>
                    <div className={classes.mainDetailsBlock}>
                      <b>About</b><br />
                      <div className={classes.textPrimary}>
                        {doc.description}
                      </div>
                    </div>
                    <div className={classes.mainDetailsBlock}>
                      <b>Certificate originally sent to</b><br />
                      <Tooltip
                        title={
                          <div>
                            <p><b>Designation</b>: {doc.ownershipHistory[0].lastName}</p>
                            <p><b>Organization</b>: {doc.ownershipHistory[0].organizationName}</p>
                            <p><b>email</b>: {doc.ownershipHistory[0].email}</p>
                          </div>
                        }
                        placement="bottom" arrow
                      >
                        <span style={{ cursor: 'pointer' }}>
                          {doc.ownershipHistory[0].firstName}
                        </span>
                      </Tooltip>
                    </div>
                  </GridItem>
                </GridContainer>
              </GridItem>
              <GridItem md={5}>
                <GridContainer spacing={2} alignItems="stretch">
                  <GridItem md={6}>
                    <PaddedCard cardProps={{ className: classes.fullHeight }}>
                      {/* //TODO: change to first name and last name */}
                      <DocDetailItem title="Current Owner"
                        description={
                          <Tooltip
                            title={
                              <div>
                                <p><b>Designation</b>: {doc.ownershipHistory[doc.ownershipHistory.length - 1].lastName}</p>
                                <p><b>Organization</b>: {doc.ownershipHistory[doc.ownershipHistory.length - 1].organizationName}</p>
                                <p><b>email</b>: {doc.ownershipHistory[doc.ownershipHistory.length - 1].email}</p>
                              </div>
                            }
                            placement="right" arrow
                          >
                            <span style={{ cursor: 'pointer' }}>{doc.ownershipHistory[doc.ownershipHistory.length - 1].firstName}</span>
                          </Tooltip>
                        } />
                      <DocDetailItem title="Document Type" description={currentVersion.type} />
                      <DocDetailItem title="Document Size" description={currentVersion.size} />
                      <DocDetailItem title="Version" description={currentVersion.version} />
                      <DocDetailItem title="Owner transfers" description={doc.ownershipHistory.length - 1} />
                    </PaddedCard>
                  </GridItem>
                  <GridItem md={6} style={{ marginTop: printMode ? 160 : 'unset' }}>
                    <PaddedCard textAlign="center" cardProps={{ className: classes.fullHeight }}>
                      <Box marginBottom={2}><b>Digital Hash</b></Box>
                      <QRCode value={currentVersion.sha256.toLowerCase()} />
                      <Box marginTop={7} marginBottom={1} className={classes.shaHash}>{currentVersion.sha256.toLowerCase()}</Box>
                      <CopyToClipboard onCopy={this.showCopySuccess} text={currentVersion.sha256} />
                    </PaddedCard>
                  </GridItem>
                </GridContainer>
              </GridItem>
            </GridContainer>
          </PaddedCard>
        </Box>
        <Box p={2}>
          <GridContainer spacing={2}>
            <GridItem md={4}>
              <Typography className={classes.sectionHeader} variant="h5">
                Transfer History
              </Typography>
              <ResourceList
                cardProps={{ raised: true }}
                headings={transferHeadings}
                rowData={transferHistory}
                emptyText="There are currently no transfers for this document."
                tooltip={true}
              />
            </GridItem>
            <GridItem md={4}>
              <Typography className={classes.sectionHeader} variant="h5">
                Document Permissions
              </Typography>
              <ResourceList
                cardProps={{ raised: true }}
                headings={permissionHeadings}
                rowData={doc.permissions}
                emptyText="There are currently no permissions provided."
                tooltip={true}
              />
            </GridItem>
            {!printMode && <GridItem md={4}>
              <Typography className={classes.sectionHeader} variant="h5">
                Version History
              </Typography>
              <ResourceList
                getRowId={row => row.version}
                cardProps={{ raised: true }}
                headings={versionHeadings}
                handleShowAttestors={this.handleShowAttestors}
                rowData={doc.versions}
                tooltip={false}
              />
            </GridItem>}
          </GridContainer>
        </Box>
        <UploadDoc
          open={JSON.parse(versionModal || false)}
          toggleDialog={this.toggleVersionDialog}
          onSubmit={this.handleVersionUpdate}
        />
        <AttestorsList
          open={Boolean(attestors)}
          toggleDialog={this.toggleAttestorsDialog}
          versions={doc.versions}
          location={this.props.location}
        />
      </PageWrapper>
    );
  }
}

const connected = connect(
  state => ({
    userInfo: state.login.user_info,
    userLoading: state.login.user_info_loading,
    doc: state.doc.data,
    loading: state.doc.loading,
    organizations: state.users.organizations,
    usersFetched: state.users.isSuccess,
    printMode: state.router.location.query.print === 'true',
  }),
  {
    getDocDetails,
    attestDocument,
    showNotification,
    getOrganizations,
    startVersionUpdate,
    freezeDocument,
    deleteDocument
  },
)(withstyles(styles)(DocDetails));

export default withRouter(connected);