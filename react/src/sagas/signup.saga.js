import { takeEvery, put, delay } from "redux-saga/effects";
import { replace } from "react-router-redux";
import { SIGNUP_SUBMIT_SUCCESS } from "../actions/signup.actions";

function* redirectLogin() {
  yield delay(1000);
  yield put(replace("/login"));
}

function* signupSaga() {
  yield takeEvery(SIGNUP_SUBMIT_SUCCESS, redirectLogin);
}

export default signupSaga;
