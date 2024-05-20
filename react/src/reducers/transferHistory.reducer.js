import {
  GET_TRANSFER_HISTORY_REQUEST,
  GET_TRANSFER_HISTORY_SUCCESS,
  GET_TRANSFER_HISTORY_FAILED
} from '../actions/transferHistory.actions';

const initialState = {
  transfers: null,
  loading: null,
  error: null,
  isSuccess: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_TRANSFER_HISTORY_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case GET_TRANSFER_HISTORY_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        isSuccess: true,
        transfers: action.data.result
      };

    case GET_TRANSFER_HISTORY_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
        transfers: initialState.transfers
      };

    default:
      return state;
  }
}
