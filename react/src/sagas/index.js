import { fork } from "redux-saga/effects";
import { sagaMiddleware } from "../store/configureStore";
import apiSaga from "./api.saga";
import appSaga from "./app.saga";
import loginSaga from "./login.saga";
import logoutSaga from "./logout.saga";
import usersSaga from './users.saga'
import docSaga from './doc.saga'
import documentListSaga from './documentList.saga'
import transferDocumentSaga from './transferDocument.saga';
import invitesSaga from './invites.saga'
import freezeDocumentSaga from './freezeDoc.saga'
import deleteDocumentSaga from './deleteDocument.saga'
import signupSaga from './signup.saga'

function* rootSaga() {
  yield fork(appSaga);
  yield fork(apiSaga);
  yield fork(loginSaga);
  yield fork(usersSaga);
  yield fork(logoutSaga);
  yield fork(docSaga);
  yield fork(documentListSaga);
  yield fork(transferDocumentSaga);
  yield fork(invitesSaga);
  yield fork(freezeDocumentSaga);
  yield fork(deleteDocumentSaga);
  yield fork(signupSaga);
}

const runSaga = () => {
  sagaMiddleware.run(rootSaga);
};

export default runSaga;
