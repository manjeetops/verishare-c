import React from "react";
import { Grid } from "@material-ui/core";
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import dayjs from 'dayjs'
import { getTransferHistory } from '../../actions/transferHistory.actions'
import { getOrganizations } from '../../actions/users.actions'

class TransferHistory extends React.Component {

  componentWillMount() {
    this.props.getTransferHistory()
    // TODO: improve this
    this.props.getOrganizations()
  }

  getOrganizationById(orgId) {
    let org 
    this.props.organizations.forEach((organization) => {
      if(organization.org_id === orgId) {
        org = organization
      }
    })

    return org.business_name
  }

  render() {
    const { classes } = this.props;

    const transfers = this.props.transfers
    if (this.props.trnasferHistoryFetched === true && this.props.organizationsFetched === true) {
      return (
        <Grid container style={{ marginTop: 130 }}>
          <Grid item xs={1}></Grid>
          <Grid item sm={10}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h5" component="h2" align="center">
                  Document Share Tracker
                  </Typography> <br />
                <VerticalTimeline>
                  {
                    (transfers || []).map(transfer => (
                      <VerticalTimelineElement
                        className="vertical-timeline-element--work"
                        key={transfer.transfer_id}
                        // contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
                        contentArrowStyle={{ borderRight: '7px solid  rgb(33, 150, 243)' }}
                        date={dayjs(transfer.created_at).format('YYYY-MM-DD | HH:mm:ss')}
                        iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
                        icon={<AccessTimeIcon />}
                      >
                        <Tooltip
                          title={
                            <div>
                              <p><b>Description</b>: {transfer.document.description}</p>
                              <p><b>Version</b>: {transfer.document.version}</p>
                              <p><b>Sha256</b>: {transfer.document.versions[0].sha256}</p>
                            </div>
                          }
                          placement="right" interactive>
                          <Button style={{ textTransform: "none" }}>
                            <h3 className="vertical-timeline-element-title">{transfer.document.name}</h3>
                          </Button>
                        </Tooltip><br />
                        <Tooltip
                          title={
                            <div>
                              <p><b>email</b>: {transfer.from_user.email}</p>
                              <p><b>Organization</b>: {this.getOrganizationById(transfer.from_user.org_id)}</p>
                            </div>
                          }
                          placement="right" interactive>
                          <Button style={{ textTransform: "none" }}>
                            <p> From: {`${transfer.from_user.first_name} (${transfer.from_user.last_name})`}</p>
                          </Button>
                        </Tooltip><br />
                        <Tooltip
                          title={
                            <div>
                              <p><b>email</b>: {transfer.to_user.email}</p>
                              <p><b>Organization</b>: {this.getOrganizationById(transfer.to_user.org_id)}</p>
                            </div>
                          }
                          placement="right" interactive>
                          <Button style={{ textTransform: "none" }}>
                            <p> To: {`${transfer.to_user.first_name} (${transfer.to_user.last_name})`}</p>
                          </Button>
                        </Tooltip>
                      </VerticalTimelineElement>
                    ))
                  }
                </VerticalTimeline>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );

    } else {
      return (<div id="app"></div>)
    }

  }
}

const styles = {
  card: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  }
};

const mapDispatchToProps = {
  getTransferHistory,
  getOrganizations
};

const mapStateToProps = state => {
  return ({
    transfers: state.transferHistory.transfers,
    trnasferHistoryFetched: state.transferHistory.isSuccess,
    organizations: state.users.organizations,
    organizationsFetched: state.users.isSuccess
  })
};

const connected = connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TransferHistory));

export default connected;
