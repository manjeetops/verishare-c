import { takeEvery, put } from "redux-saga/effects";
import { INVITE_SUCCESS, DELETE_INVITE_SUCCESS, getInvites } from "../actions/invites.actions";

function* refetchInvites() {
  yield put(getInvites());
}

function* invitesSaga() {
  yield takeEvery(DELETE_INVITE_SUCCESS, refetchInvites);
  yield takeEvery(INVITE_SUCCESS, refetchInvites);
}

export default invitesSaga;
