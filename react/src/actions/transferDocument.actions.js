import { CALL_API } from "./api.actions";

export const TRANSFER_DOCUMENT_REQUEST = "actions/document/TRANSFER_DOCUMENT_REQUEST";
export const TRANSFER_DOCUMENT_FAILED = "actions/document/TRANSFER_DOCUMENT_FAILED";
export const TRANSFER_DOCUMENT_SUCCESS = "actions/document/TRANSFER_DOCUMENT_SUCCESS";

export const transferDocument = (userId, docId, toUserId) => {
  return {
    type: CALL_API,
    types: [TRANSFER_DOCUMENT_REQUEST, TRANSFER_DOCUMENT_SUCCESS, TRANSFER_DOCUMENT_FAILED],
    method: 'post',
    endPoint: `api/v1/users/${userId}/documents/${docId}/transfer`,
    body: {
      userId: toUserId
    },
    showLoader: true,
    notificationOpts: {
      error: {
        variant: 'error'
      },
      success: {
        message: 'Document transferred successfully',
      },
    },
  };
};



export const SHARE_DOCUMENT_REQUEST = "actions/document/SHARE_DOCUMENT_REQUEST";
export const SHARE_DOCUMENT_FAILED = "actions/document/SHARE_DOCUMENT_FAILED";
export const SHARE_DOCUMENT_SUCCESS = "actions/document/SHARE_DOCUMENT_SUCCESS";

export const shareDocumentAccess = (userId, docId, receiverId, type, scope) => {
  return {
    type: CALL_API,
    types: [SHARE_DOCUMENT_REQUEST, SHARE_DOCUMENT_SUCCESS, SHARE_DOCUMENT_FAILED],
    method: 'post',
    endPoint: `api/v1/users/${userId}/documents/${docId}/share`,
    body: {
      receiverId: receiverId,
      accessType: type,
      accessScope: scope
    },
    showLoader: true,
    notificationOpts: {
      error: {
        variant: 'error'
      },
      success: {
        message: 'Document shared successfully',
      },
    },
  };
};