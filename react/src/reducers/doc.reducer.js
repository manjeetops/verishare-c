import {
  GET_DOC_DETAILS_FAILED,
  GET_DOC_DETAILS_REQUEST,
  GET_DOC_DETAILS_SUCCESS,
} from '../actions/doc.actions';

const initialState = {
  loading: false,
  error: null,
  data: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_DOC_DETAILS_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case GET_DOC_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        data: action.data.result,
      };

    case GET_DOC_DETAILS_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
        data: null,
      };

    default:
      return state;
  }
}
