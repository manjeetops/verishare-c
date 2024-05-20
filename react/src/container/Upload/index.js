import React from "react";
import { Grid } from "@material-ui/core";
import Uploader from "../../components/Uploader";
import DocumentList from "../../components/DocumentList";
import SharedDocuments from "../../components/DocumentList/sharedDocuments"
import AllOrgDocuments from "../../components/DocumentList/organizationDocuments"
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getDocumentList, getSharedDocumentsList, getAllOrgDocuments } from "../../actions/documentList.actions";
import { postUploadedFile } from "../../actions/uploadFile.actions";

class Upload extends React.Component {
  componentDidMount() {
    let user_id = localStorage.getItem("USER_ID");
    const { getDocumentList, getSharedDocumentsList, login, getAllOrgDocuments } = this.props
    getDocumentList(user_id);
    getSharedDocumentsList(user_id);

    if (!login.user_info || login.user_info_loading) {
      this.fetchLater();
    } else {
      if (login.user_info && login.user_info.role === 'ADMIN') {
        getAllOrgDocuments(login.user_info.organizationId)
      }
    }
  }

  fetchLater() {
    setTimeout(() => {
      const { login, getAllOrgDocuments } = this.props;
      if (!login.user_info || login.user_info_loading) {
        this.fetchLater();
      } else {
        if (login.user_info && login.user_info.role === 'ADMIN') {
          getAllOrgDocuments(login.user_info.organizationId)
        }
      }
    }, 500);
  }

  render() {
    return (
      <Grid container style={{ marginTop: 130 }}>
        <Grid item sm={3}>
          <Uploader postUploadedFile={this.props.postUploadedFile} />
        </Grid>
        <Grid item xs={8} style={{ marginLeft: 30 }}>
          <DocumentList documentList={this.props.document_info} /> <br /> <br />
          <SharedDocuments documentShareList={this.props.document_share_list} /> <br /> <br />
          {(this.props.login.user_info && this.props.login.user_info.role === 'ADMIN') &&
            <AllOrgDocuments allOrgDocuments={this.props.all_documents} />
          }
        </Grid>
      </Grid>
    );
  }
}

const mapDispatchToProps = {
  getDocumentList,
  postUploadedFile,
  getSharedDocumentsList,
  getAllOrgDocuments
};

const mapStateToProps = state => {
  return {
    document_info: state.documentList.document_info,
    document_share_list: state.documentList.document_share_list,
    all_documents: state.documentList.all_org_documents,
    login: state.login
  };
};

Upload.propTypes = {
  document_info: PropTypes.array,
  postUploadedFile: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(Upload);
