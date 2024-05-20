import { takeEvery, put, delay, select } from "redux-saga/effects";
import { FREEZE_DOCUMENT_SUCCESS, getDocDetails } from "../actions/doc.actions";


export const getDocState = state => state.doc.data;

function* refetchDocument() {
  let currentDocDetails = yield select(getDocState);
  const userId = localStorage.getItem("USER_ID");
  yield delay(500);
  yield put(getDocDetails(userId, currentDocDetails.id));
}

function* freezeDocumentSaga() {
  yield takeEvery(FREEZE_DOCUMENT_SUCCESS, refetchDocument);
}

export default freezeDocumentSaga;
