import {
  LOGIN_SUBMIT_REQUEST,
  LOGIN_SUBMIT_SUCCESS,
  LOGIN_SUBMIT_FAILED,
  GET_USER_INFO_FAILED,
  GET_USER_INFO_REQUEST,
  GET_USER_INFO_SUCCESS,
  REFRESH_TOKEN_SUCCESS,
  SET_TOKENS
} from "../actions/login.actions";
import {
  LOGOUT_SUBMIT_SUCCESS,
  LOGOUT_SUBMIT_FAILED,
  LOGOUT_SUBMIT_REQUEST
} from "../actions/logout.actions";

const initialState = {
  refresh_token: null,
  access_token: null,
  loading: false,
  error: null,
  user_info: {},
  user_info_loading: false,
  isSuccess: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUBMIT_REQUEST:
      return {
        ...state,
        loading: true
      };

    case LOGIN_SUBMIT_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        isSuccess: true,
        refresh_token: action.data.result.refresh_token,
        access_token: action.data.result.access_token,
        expires_in: action.data.result.expires_in
      };

    case REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        access_token: action.data.result.access_token
      };

    case LOGIN_SUBMIT_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
        refresh_token: initialState.refresh_token,
        access_token: initialState.access_token
      };

    case SET_TOKENS:
      return {
        ...state,
        access_token: action.access_Tken,
        refresh_token: action.refreshToken
      };

    case GET_USER_INFO_REQUEST:
      return {
        ...state,
        user_info_loading: true
      };

    case GET_USER_INFO_SUCCESS:
      return {
        ...state,
        user_info_loading: false,
        error: null,
        user_info: action.data.result
      };

    case GET_USER_INFO_FAILED:
      return {
        ...state,
        user_info_loading: false,
        error: action.payload,
        user_info: initialState.user_info
      };

    case LOGOUT_SUBMIT_REQUEST:
      return {
        ...state,
        loading: true
      };

    case LOGOUT_SUBMIT_SUCCESS:
      return {
        ...state,
        loading: false,
        refresh_token: null
      };

    case LOGOUT_SUBMIT_FAILED:
      return {
        ...state,
        error: action.payload
      };

    default:
      return state;
  }
};
