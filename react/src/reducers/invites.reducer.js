import {
  GET_INVITES_REQUEST, GET_INVITES_SUCCESS, GET_INVITES_FAILED,
} from '../actions/invites.actions';

const initialState = {
  loading: false,
  error: null,
  data: null,
  isSuccess: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_INVITES_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case GET_INVITES_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        isSuccess: true,
        data: action.data.result,
      };

    case GET_INVITES_FAILED:
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
