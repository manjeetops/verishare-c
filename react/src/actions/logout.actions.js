import { CALL_API } from "./api.actions";

export const LOGOUT_SUBMIT_REQUEST = "actions/login/LOGOUT_SUBMIT_REQUEST";
export const LOGOUT_SUBMIT_FAILED = "actions/login/LOGOUT_SUBMIT_FAILED";
export const LOGOUT_SUBMIT_SUCCESS = "actions/login/LOGOUT_SUBMIT_SUCCESS";

export const logoutUser = refresh_token => ({
  type: CALL_API,
  types: [LOGOUT_SUBMIT_REQUEST, LOGOUT_SUBMIT_SUCCESS, LOGOUT_SUBMIT_FAILED],
  method: "post",
  endPoint: "api/v1/protocol/openid-connect/logout",
  showLoader: true,
  body: { refresh_token }
});
