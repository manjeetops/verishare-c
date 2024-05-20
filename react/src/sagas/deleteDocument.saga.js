import { takeEvery, put, delay } from "redux-saga/effects";
import { replace } from "react-router-redux";
import { DELETE_DOCUMENT_SUCCESS } from "../actions/doc.actions";

function* redirectToHome() {
  yield delay(500);
  yield put(replace("/documents"));
}

function* deleteDocumentSaga() {
  yield takeEvery(DELETE_DOCUMENT_SUCCESS, redirectToHome);
}

export default deleteDocumentSaga;
