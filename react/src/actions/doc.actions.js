import { createAction } from 'redux-actions';
import { CALL_API } from "./api.actions";

export const GET_DOC_DETAILS_REQUEST = 'actions/login/GET_DOC_DETAILS_REQUEST';
export const GET_DOC_DETAILS_FAILED = 'actions/login/GET_DOC_DETAILS_FAILED';
export const GET_DOC_DETAILS_SUCCESS = 'actions/login/GET_DOC_DETAILS_SUCCESS';

export const ATTEST_DOCUMENT_REQUEST = 'actions/login/ATTEST_DOCUMENT_REQUEST';
export const ATTEST_DOCUMENT_FAILED = 'actions/login/ATTEST_DOCUMENT_FAILED';
export const ATTEST_DOCUMENT_SUCCESS = 'actions/login/ATTEST_DOCUMENT_SUCCESS';

export const START_VERSION_UPDATE = 'actions/login/START_VERSION_UPDATE';
export const VERSION_UPDATE_REQUEST = 'actions/login/VERSION_UPDATE_REQUEST';
export const VERSION_UPDATE_FAILED = 'actions/login/VERSION_UPDATE_FAILED';
export const VERSION_UPDATE_SUCCESS = 'actions/login/VERSION_UPDATE_SUCCESS';

export const FREEZE_DOCUMENT_REQUEST = 'actions/login/FREEZE_DOCUMENT_REQUEST';
export const FREEZE_DOCUMENT_SUCCESS = 'actions/login/FREEZE_DOCUMENT_SUCCESS';
export const FREEZE_DOCUMENT_FAILED = 'actions/login/FREEZE_DOCUMENT_FAILED';

export const DELETE_DOCUMENT_REQUEST = 'actions/login/DELETE_DOCUMENT_REQUEST';
export const DELETE_DOCUMENT_SUCCESS = 'actions/login/DELETE_DOCUMENT_SUCCESS';
export const DELETE_DOCUMENT_FAILED = 'actions/login/DELETE_DOCUMENT_FAILED';

export const getDocDetails = (userId, documentId) => ({
  type: CALL_API,
  types: [
    GET_DOC_DETAILS_REQUEST,
    GET_DOC_DETAILS_SUCCESS,
    GET_DOC_DETAILS_FAILED,
  ],
  method: 'get',
  endPoint: `api/v1/users/${userId}/documents/${documentId}`,
  showLoader: true,
});

export const attestDocument = (documentId, version) => ({
  type: CALL_API,
  types: [
    ATTEST_DOCUMENT_REQUEST,
    ATTEST_DOCUMENT_SUCCESS,
    ATTEST_DOCUMENT_FAILED,
  ],
  method: 'post',
  endPoint: `api/v1/documents/${documentId}/attestations`,
  body: {
    version,
  },
  showLoader: true,
  notificationOpts: {
    error: {
      variant: 'error'
    },
    success: {
      message: 'Attestation Complete!',
    },
  },
});

export const startVersionUpdate = createAction(
  START_VERSION_UPDATE,
  (documentId, file) => ({ documentId, file }),
);

export const updateDocumentVersion = (userId, documentId, document) => ({
  type: CALL_API,
  types: [
    VERSION_UPDATE_REQUEST,
    VERSION_UPDATE_SUCCESS,
    VERSION_UPDATE_FAILED
  ],
  method: "put",
  endPoint: `api/v1/users/${userId}/documents/${documentId}/version`,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  body: document,
  showLoader: true,
});

export const freezeDocument = (documentId, status) => ({
  type: CALL_API,
  types: [
    FREEZE_DOCUMENT_REQUEST,
    FREEZE_DOCUMENT_SUCCESS,
    FREEZE_DOCUMENT_FAILED
  ],
  method: "put",
  endPoint: `api/v1/documents/${documentId}/freeze`,
  body: {
    status
  },
  showLoader: true,
  notificationOpts: {
    error: {
      variant: 'error'
    },
    success: {
      message: status ? `Document frozen!` : `Document unfrozen!`,
    },
  },
});

export const deleteDocument = (userId, documentId) => ({
  type: CALL_API,
  types: [
   DELETE_DOCUMENT_REQUEST,
   DELETE_DOCUMENT_SUCCESS,
   DELETE_DOCUMENT_FAILED
  ],
  method: "delete",
  endPoint: `api/v1/users/${userId}/documents/${documentId}`,
  showLoader: true,
  notificationOpts: {
    error: {
      variant: 'error'
    },
    success: {
      message: 'Document has been deleted',
    },
  },
});

