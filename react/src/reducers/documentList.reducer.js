import {
  GET_DOCUMENT_REQUEST,
  GET_DOCUMENT_FAILED,
  GET_DOCUMENT_SUCCESS,
  GET_SHARE_DOCUMENT_REQUEST,
  GET_SHARE_DOCUMENT_SUCCESS,
  GET_SHARE_DOCUMENT_FAILED,
  GET_ALL_ORG_DOCUMENTS_REQUEST,
  GET_ALL_ORG_DOCUMENTS_SUCCESS,
  GET_ALL_ORG_DOCUMENTS_FAILED
} from "../actions/documentList.actions";

const initialState = {
  document_info_loading: false,
  document_share_list_loading: false,
  all_document_list_loading: false,
  isDocumentShareListSuccess: null,
  isAllDocumentListSuccess: null,
  document_info: null,
  document_share_list: null,
  all_org_documents: null,
  isSuccess: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_DOCUMENT_REQUEST:
      return {
        ...state,
        document_info_loading: true
      };

    case GET_DOCUMENT_SUCCESS:
      return {
        ...state,
        document_info_loading: false,
        error: null,
        isSuccess: true,
        document_info: action.data.result
      };

    case GET_DOCUMENT_FAILED:
      return {
        ...state,
        document_info_loading: false,
        error: action.payload,
        document_info: null
      };

    case GET_SHARE_DOCUMENT_REQUEST:
      return {
        ...state,
        document_share_list_loading: true
      };

    case GET_SHARE_DOCUMENT_SUCCESS:
      return {
        ...state,
        document_share_list_loading: false,
        error: null,
        isDocumentShareListSuccess: true,
        document_share_list: action.data.result
      };

    case GET_SHARE_DOCUMENT_FAILED:
      return {
        ...state,
        document_share_list_loading: false,
        error: action.payload,
        document_share_list: null
      };

    case GET_ALL_ORG_DOCUMENTS_REQUEST:
      return {
        ...state,
        all_document_list_loading: true
      };

    case GET_ALL_ORG_DOCUMENTS_SUCCESS:
      return {
        ...state,
        all_document_list_loading: false,
        error: null,
        isAllDocumentListSuccess: true,
        all_org_documents: action.data.result
      };

    case GET_ALL_ORG_DOCUMENTS_FAILED:
      return {
        ...state,
        all_document_list_loading: false,
        error: action.payload,
        all_org_documents: null
      };

    default:
      return state;
  }
};
