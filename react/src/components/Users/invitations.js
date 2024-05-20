import React from "react";
import { withStyles } from '@material-ui/core/styles';
import { Grid } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { connect } from "react-redux";
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import dayjs from 'dayjs'
import Button from '@material-ui/core/Button';
import { getInvites, deleteInvitation } from '../../actions/invites.actions'
import InviteUser from './inviteUser'



class Invitations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openDialog: false
    };
  }

  componentDidMount() {
    this.props.getInvites();
  }



  handleInviteUserClick = () => {
    this.setState({ openDialog: !this.state.openDialog })
  }

  handleDeleteClick = (invitationId) => {
    this.props.deleteInvitation(invitationId)
  }

  render() {
    const { classes, invites } = this.props;
    // const { doc = '' } = this.getSearchParams();


    return (
      <Grid container style={{ marginTop: 100 }}>
        <Grid item xs={1}></Grid>
        <Grid item sm={10}>
          <Typography variant="h5" component="h2" align="center">
            Pending Invitations
          </Typography>
          <Button onClick={() => this.handleInviteUserClick()} variant="outlined">
            Invite user
          </Button>
          <InviteUser
            open={this.state.openDialog}
            handleClose={this.handleInviteUserClick}
          />
          <TableContainer component={Paper} style={{ marginTop: 20 }}>
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
                {(invites || []).map(invite => (
                  !invite.joined && (<TableRow>
                    <TableCell align="left">{`${invite.firstName} (${invite.lastName})`}</TableCell>
                    <TableCell align="left">{`${invite.email}`}</TableCell>
                    <TableCell align="left">{dayjs(invite.created_at).format('YYYY-MM-DD | HH:mm:ss')}</TableCell>

                    <Button onClick={() => this.handleDeleteClick(invite.id)}><DeleteOutlineIcon align="left" /></Button>
                  </TableRow>)
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

    );
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
  getInvites,
  deleteInvitation
};

const mapStateToProps = state => {
  return {
    invites: state.invites.data,
    invitesFetched: state.invites.isSuccess,
  };
};

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Invitations));

export default connected;
