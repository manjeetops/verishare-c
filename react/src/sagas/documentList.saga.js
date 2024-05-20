import { takeEvery, put, delay } from "redux-saga/effects";
import { POST_UPLOADED_FILE_SUCCESS } from "../actions/uploadFile.actions";
import { getDocumentList } from "../actions/documentList.actions";
import { USER_ID } from "../constants";

export const getLoginDetails = state => state.login;

function* refetchDocumentsList() {
  const userId = localStorage.getItem(USER_ID);
  yield delay(500);
  yield put(getDocumentList(userId));
}

function* documentListSaga() {
  yield takeEvery(POST_UPLOADED_FILE_SUCCESS, refetchDocumentsList);
}

export default documentListSaga;
