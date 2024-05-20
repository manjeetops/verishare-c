import { takeEvery, put, select, delay } from "redux-saga/effects";
import { replace } from "react-router-redux";
import { LOGOUT_SUBMIT_SUCCESS, logoutUser } from "../actions/logout.actions";
import { showNotification } from "../actions/app.actions";

export const getLoginDetails = state => state.login;

// TODO: How the success is identified ?
function* fetchLoginInfo() {
  let loginDetails = yield select(getLoginDetails);

  yield put(logoutUser(loginDetails.refresh_token));
  localStorage.clear();
  yield put(showNotification("You're successfully logged out."));
  yield delay(500);
  yield put(replace("/login"));
}

function* logoutSaga() {
  yield takeEvery(LOGOUT_SUBMIT_SUCCESS, fetchLoginInfo);
}

export default logoutSaga;
