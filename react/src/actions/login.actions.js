import { CALL_API } from "./api.actions";

export const LOGIN_SUBMIT_REQUEST = 'actions/login/LOGIN_SUBMIT_REQUEST';
export const LOGIN_SUBMIT_FAILED = 'actions/login/LOGIN_SUBMIT_FAILED';
export const LOGIN_SUBMIT_SUCCESS = 'actions/login/LOGIN_SUBMIT_SUCCESS';

export const CHECK_REFRESH_TOKEN = 'actions/login/CHECK_REFRESH_TOKEN';
export const REFRESH_TOKEN_REQUEST = 'actions/login/REFRESH_TOKEN_REQUEST';
export const REFRESH_TOKEN_FAILED = 'actions/login/REFRESH_TOKEN_FAILED';
export const REFRESH_TOKEN_SUCCESS = 'actions/login/REFRESH_TOKEN_SUCCESS';

export const UPDATE_TOKEN_SUCCESS = 'actions/login/UPDATE_TOKEN_SUCCESS';

export const loginUser = user => ({
  type: CALL_API,
  types: [
    LOGIN_SUBMIT_REQUEST,
    LOGIN_SUBMIT_SUCCESS,
    LOGIN_SUBMIT_FAILED,
  ],
  method: 'post',
  endPoint: 'api/v1/protocol/openid-connect/login',
  showLoader: true,
  body: user,
  notificationOpts: {
    error: {
      variant: 'error'
    },
    success: {
      message: 'Welcome back',
    },
  },
});

export const refreshAccessToken = refreshToken => ({
  type: CALL_API,
  types: [
    REFRESH_TOKEN_REQUEST,
    REFRESH_TOKEN_SUCCESS,
    REFRESH_TOKEN_FAILED,
  ],
  method: 'post',
  endPoint: 'api/v1/protocol/openid-connect/token',
  body: {
    refresh_token: refreshToken
  },
});

export const GET_USER_INFO_REQUEST = 'actions/login/GET_USER_INFO_REQUEST';
export const GET_USER_INFO_FAILED = 'actions/login/GET_USER_INFO_FAILED';
export const GET_USER_INFO_SUCCESS = 'actions/login/GET_USER_INFO_SUCCESS';

export const getUserInfo = token => ({
  type: CALL_API,
  types: [
    GET_USER_INFO_REQUEST,
    GET_USER_INFO_SUCCESS,
    GET_USER_INFO_FAILED,
  ],
  method: 'get',
  endPoint: `api/v1/user-info`,
  showLoader: true,
  headers: {
    authorization: `Bearer ${token}`
  }
});

export const SET_TOKENS = 'actions/login/SET_TOKENS';

export const setTokens = (accessToken, refreshToken) => ({
  type: SET_TOKENS,
  accessToken,
  refreshToken,
});

export const checkRefreshToken = (validTill, refreshToken) => ({
  type: CHECK_REFRESH_TOKEN,
  validTill,
  refreshToken,
});

export const updateTokenSuccess = () => ({
  type: UPDATE_TOKEN_SUCCESS,
});
