import { CALL_API } from "./api.actions";

export const GET_TRANSFER_HISTORY_REQUEST = 'actions/users/GET_TRANSFER_HISTORY_REQUEST';
export const GET_TRANSFER_HISTORY_FAILED = 'actions/users/GET_TRANSFER_HISTORY_FAILED';
export const GET_TRANSFER_HISTORY_SUCCESS = 'actions/users/GET_TRANSFER_HISTORY_SUCCESS';

export const getTransferHistory = () => ({
  type: CALL_API,
  types: [
    GET_TRANSFER_HISTORY_REQUEST,
    GET_TRANSFER_HISTORY_SUCCESS,
    GET_TRANSFER_HISTORY_FAILED,
  ],
  method: 'get',
  endPoint: `api/v1/transfers`,
});