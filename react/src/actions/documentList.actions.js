import { CALL_API } from "./api.actions";

export const GET_DOCUMENT_REQUEST = "actions/document/GET_DOCUMENT_REQUEST";
export const GET_DOCUMENT_FAILED = "actions/document/GET_DOCUMENT_FAILED";
export const GET_DOCUMENT_SUCCESS = "actions/document/GET_DOCUMENT_SUCCESS";

export const getDocumentList = userId => {
  return {
    type: CALL_API,
    types: [GET_DOCUMENT_REQUEST, GET_DOCUMENT_SUCCESS, GET_DOCUMENT_FAILED],
    method: "get",
    endPoint: `api/v1/users/${userId}/documents`
  };
};

export const GET_SHARE_DOCUMENT_REQUEST = "actions/document/GET_SHARE_DOCUMENT_REQUEST";
export const GET_SHARE_DOCUMENT_FAILED = "actions/document/GET_SHARE_DOCUMENT_FAILED";
export const GET_SHARE_DOCUMENT_SUCCESS = "actions/document/GET_SHARE_DOCUMENT_SUCCESS";

export const getSharedDocumentsList = userId => {
  return {
    type: CALL_API,
    types: [GET_SHARE_DOCUMENT_REQUEST, GET_SHARE_DOCUMENT_SUCCESS, GET_SHARE_DOCUMENT_FAILED],
    method: "get",
    endPoint: `api/v1/users/${userId}/documents-permission`
  };
};

export const GET_ALL_ORG_DOCUMENTS_REQUEST = "actions/document/GET_ALL_ORG_DOCUMENTS_REQUEST";
export const GET_ALL_ORG_DOCUMENTS_FAILED = "actions/document/GET_ALL_ORG_DOCUMENTS_FAILED";
export const GET_ALL_ORG_DOCUMENTS_SUCCESS = "actions/document/GET_ALL_ORG_DOCUMENTS_SUCCESS";

export const getAllOrgDocuments = orgId => {
  return {
    type: CALL_API,
    types: [GET_ALL_ORG_DOCUMENTS_REQUEST, GET_ALL_ORG_DOCUMENTS_SUCCESS, GET_ALL_ORG_DOCUMENTS_FAILED],
    method: "get",
    endPoint: `api/v1/organizations/${orgId}/documents`
  };
};