import {
  TRANSFER_DOCUMENT_REQUEST, TRANSFER_DOCUMENT_SUCCESS, TRANSFER_DOCUMENT_FAILED
} from '../actions/transferDocument.actions';

const initialState = {
  loading: null,
  error: null,
  isSuccess: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TRANSFER_DOCUMENT_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case TRANSFER_DOCUMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        isSuccess: true,
      };

    case TRANSFER_DOCUMENT_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
