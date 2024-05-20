import { takeEvery, put, delay } from "redux-saga/effects";
import { replace } from "react-router-redux";
import { TRANSFER_DOCUMENT_SUCCESS } from "../actions/transferDocument.actions";

export const getLoginDetails = state => state.login;

// TODO: How the success is identified ?
function* transferDocument() {
  yield delay(500);
  yield put(replace("/users"));
}

function* transferDocumentSaga() {
  yield takeEvery(TRANSFER_DOCUMENT_SUCCESS, transferDocument);
}

export default transferDocumentSaga;
