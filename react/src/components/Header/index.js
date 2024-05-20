import React from "react";
import withTheme from "@material-ui/styles/withTheme";
import { withStyles } from "@material-ui/core/styles";
import {
  AppBar,
  Toolbar,
  IconButton,
  MenuItem,
  Popper,
  Paper,
  ClickAwayListener,
  MenuList
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DeqodeLogo from "../../lib/assets/images/deqodeText.png";
import BoeingLogo from "../../lib/assets/images/boeinglong.png";
import PropTypes from "prop-types";
import User from "../../lib/assets/images/user.png";
import { logoutUser } from "../../actions/logout.actions";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import config from '../../config'

const getLogo = () => {
  const organization = config.get('organizationName')
  let Logo
  switch (organization) {
    case "boeing":
      Logo = BoeingLogo
      break;
  
    case "deqode":
      Logo = DeqodeLogo
      break;
  
    default:
      break;
  }

  return Logo
}

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
    this.anchorRef = null;
  }

  handleToggle = () => {
    this.setState({ open: !this.state.open });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleLogout = () => {
    this.setState({open:false})
    this.props.logoutUser(this.props.token);
  };

  render() {
    const { classes } = this.props;
    let login = this.props.token;
  
    return (
      <div>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar className={classes.appBar}>
            <div style={{ float: "left", marginTop: 12 }}>
              <img
                src={getLogo()}
                className={classes.profileText}
                alt="logotext"
              />
            </div>
            <div style={{ float: "right" }}>
              {login === null ? (
                ""
              ) : (
                <>
                  <Button align="right" href="/users" style={{ textTransform: "none" }}>
                    <b>Users</b>
                  </Button>
                  <Button align="right" href="/documents" style={{ textTransform: "none" }}>
                    <b>Documents</b>
                  </Button>

                  <IconButton
                    ref={anchorRef => {
                      this.anchorRef = anchorRef;
                    }}
                    aria-haspopup="true"
                    onClick={this.handleToggle}
                  >
                    <img
                      src={User}
                      className={classes.userLogo}
                      alt="logotext"
                    />
                  </IconButton>
                  <Popper
                    open={this.state.open}
                    anchorEl={this.anchorRef}
                    role={undefined}
                    transition
                    disablePortal
                  >
                    <Paper>
                      <ClickAwayListener onClickAway={this.handleClose}>
                        <MenuList
                          autoFocusItem={this.state.open}
                          id="menu-list-grow"
                          key="logout"
                        >
                          <MenuItem onClick={this.handleLogout}>
                            Logout
                          </MenuItem>
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Popper>
                </>
              )}
            </div>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

const mapDispatchToProps = {
  logoutUser
};

const styles = {
  root: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-start"
  },
  appBar: {
    backgroundColor: "white",
    display: "block"
  },
  profileText: {
    height: 34
  },
  userLogo: {
    width: 30,
    borderRadius: 12
  }
};

const mapStateToProps = state => {
  return {
    token: state.login.refresh_token
  };
};

Header.propTypes = {
  classes: PropTypes.object,
  token: PropTypes.string,
  logoutUser: PropTypes.func.isRequired
};

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withTheme(Header)));

export default withRouter(connected);
