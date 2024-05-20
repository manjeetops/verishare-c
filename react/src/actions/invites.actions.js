import { CALL_API } from "./api.actions";

export const GET_INVITES_REQUEST = "actions/invites/GET_INVITES_REQUEST";
export const GET_INVITES_FAILED = "actions/invites/GET_INVITES_FAILED";
export const GET_INVITES_SUCCESS = "actions/invites/GET_INVITES_SUCCESS";

export const getInvites = () => {
  return {
    type: CALL_API,
    types: [GET_INVITES_REQUEST, GET_INVITES_SUCCESS, GET_INVITES_FAILED],
    method: "get",
    endPoint: `api/v1/invites`,
    showLoader: true
  };
};

export const INVITE_REQUEST = "actions/invites/INVITE_REQUEST";
export const INVITE_FAILED = "actions/invites/INVITE_FAILED";
export const INVITE_SUCCESS = "actions/invites/INVITE_SUCCESS";

export const inviteUser = (payload) => {
  return {
    type: CALL_API,
    types: [INVITE_REQUEST, INVITE_SUCCESS, INVITE_FAILED],
    method: "post",
    endPoint: `api/v1/invites`,
    showLoader: true,
    body: payload,
    notificationOpts: {
      error: {
        variant: 'error'
      },
      success: {
        message: 'User Invitation successful',
      },
    },
  };
};

export const DELETE_INVITE_REQUEST = "actions/invites/DELETE_INVITE_REQUEST";
export const DELETE_INVITE_FAILED = "actions/invites/DELETE_INVITE_FAILED";
export const DELETE_INVITE_SUCCESS = "actions/invites/DELETE_INVITE_SUCCESS";

export const deleteInvitation = (invitation_id) => {
  return {
    type: CALL_API,
    types: [DELETE_INVITE_REQUEST, DELETE_INVITE_SUCCESS, DELETE_INVITE_FAILED],
    method: "delete",
    endPoint: `api/v1/invites/${invitation_id}`,
    showLoader: true,
    notificationOpts: {
      error: {
        variant: 'error'
      },
      success: {
        message: 'Invitation deleted successfully',
      },
    },
  };
};