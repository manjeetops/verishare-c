import { CALL_API } from "./api.actions";

export const GET_ORGANIZATIONS_REQUEST = 'actions/users/GET_ORGANIZATIONS_REQUEST';
export const GET_ORGANIZATIONS_FAILED = 'actions/users/GET_ORGANIZATIONS_FAILED';
export const GET_ORGANIZATIONS_SUCCESS = 'actions/users/GET_ORGANIZATIONS_SUCCESS';

export const getOrganizations = () => ({
  type: CALL_API,
  types: [
    GET_ORGANIZATIONS_REQUEST,
    GET_ORGANIZATIONS_SUCCESS,
    GET_ORGANIZATIONS_FAILED,
  ],
  method: 'get',
  endPoint: `api/v1/organizations`,
});

export const GET_USERS_REQUEST = 'actions/users/GET_USERS_REQUEST';
export const GET_USERS_FAILED = 'actions/users/GET_USERS_FAILED';
export const GET_USERS_SUCCESS = 'actions/users/GET_USERS_SUCCESS';

export const getUsers = (orgId) => ({
  type: CALL_API,
  types: [
    GET_USERS_REQUEST,
    GET_USERS_SUCCESS,
    GET_USERS_FAILED,
  ],
  method: 'get',
  showLoader: true,
  endPoint: `api/v1/organizations/${orgId}/users`
});

export const GET_USER_INFO_REQUEST = 'actions/users/GET_USER_INFO_REQUEST';
export const GET_USER_INFO_FAILED = 'actions/users/GET_USER_INFO_FAILED';
export const GET_USER_INFO_SUCCESS = 'actions/users/GET_USER_INFO_SUCCESS';

export const getUserInfo = () => ({
  type: CALL_API,
  types: [
    GET_USER_INFO_REQUEST,
    GET_USER_INFO_SUCCESS,
    GET_USER_INFO_FAILED,
  ],
  method: 'get',
  endPoint: `api/v1/user-info`,
});
