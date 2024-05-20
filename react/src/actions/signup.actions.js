import { CALL_API } from "./api.actions";

export const SIGNUP_SUBMIT_REQUEST = 'actions/signup/SIGNUP_SUBMIT_REQUEST';
export const SIGNUP_SUBMIT_FAILED = 'actions/signup/SIGNUP_SUBMIT_FAILED';
export const SIGNUP_SUBMIT_SUCCESS = 'actions/signup/SIGNUP_SUBMIT_SUCCESS';

export const signUpUser = payload => ({
  type: CALL_API,
  types: [
    SIGNUP_SUBMIT_REQUEST,
    SIGNUP_SUBMIT_SUCCESS,
    SIGNUP_SUBMIT_FAILED,
  ],
  method: 'post',
  endPoint: 'api/v1/signup',
  showLoader: true,
  body: payload,
  notificationOpts: {
    error: {
      variant: 'error'
    },
    success: {
      message: 'Signup successful',
    },
  },
});