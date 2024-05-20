import { takeEvery, put, select, delay, take, race } from "redux-saga/effects";
import { push, getLocation, createMatchSelector } from 'connected-react-router';
import { showNotification } from "../actions/app.actions";
import {
  updateDocumentVersion,
  getDocDetails,
  START_VERSION_UPDATE,
  VERSION_UPDATE_FAILED,
  VERSION_UPDATE_SUCCESS,
} from "../actions/doc.actions";
import { USER_ID } from "../constants";

function* startVersionUpdate(action) {
  const { documentId, file } = action.payload;
  const userId = localStorage.getItem(USER_ID);
  const formdata = new FormData();
  formdata.append('document', file);
  yield put(updateDocumentVersion(userId, documentId, formdata));

  const { success, failed } = yield race({
    success: take(VERSION_UPDATE_SUCCESS),
    failed: take(VERSION_UPDATE_FAILED),
  });

  if (success || (
    failed
    && failed.payload
    && failed.payload.message
    && failed.payload.message.includes('Block may have been committed')
  )) {
    const { pathname } = yield select(getLocation);
    const match = yield select(createMatchSelector({ path: '/doc/:docId' }));
    yield put(getDocDetails(userId, match.params.docId));
    yield put(showNotification('Document uploaded successfully'));
    yield delay(300);
    yield put(push(pathname));
  } else {
    yield put(showNotification(failed.payload.message, {
      variant: 'error',
    }));
  }
}

function* docSaga() {
  yield takeEvery(START_VERSION_UPDATE, startVersionUpdate);
}

export default docSaga;
