import {
  POST_UPLOADED_FILE_REQUEST,
  POST_UPLOADED_FILE_FAILED,
  POST_UPLOADED_FILE_SUCCESS
} from "../actions/uploadFile.actions";

const initialState = {
  upload_file_loading: false,
  uploaded_file_info: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case POST_UPLOADED_FILE_REQUEST:
      return {
        ...state,
        upload_file_loading: true
      };

    case POST_UPLOADED_FILE_SUCCESS:
      return {
        ...state,
        upload_file_loading: false,
        error: null,
        uploaded_file_info: action.data.result
      };

    case POST_UPLOADED_FILE_FAILED:
      return {
        ...state,
        upload_file_loading: false,
        error: action.payload,
        uploaded_file_info: null
      };

    default:
      return state;
  }
};
