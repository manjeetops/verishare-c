import { takeEvery, put, select, delay, race, take, call } from "redux-saga/effects";
import { replace } from "react-router-redux";
import dayjs from "dayjs";
import {
  getUserInfo,
  refreshAccessToken,
  updateTokenSuccess,
  checkRefreshToken,
  LOGIN_SUBMIT_SUCCESS,
  REFRESH_TOKEN_SUCCESS,
  CHECK_REFRESH_TOKEN,
  GET_USER_INFO_SUCCESS,
  GET_USER_INFO_FAILED,
  UPDATE_TOKEN_SUCCESS,
} from "../actions/login.actions";
import {
  ACCESS_TOKEN_PATH,
  REFRESH_TOKEN_PATH,
  VALID_TILL,
  USER_ID,
  USER_ROLE
} from "../constants";
import { showNotification } from "../actions/app.actions";

export const getLoginDetails = state => state.login;

// TODO: How the success is identified ?
function* fetchUserInfo() {
  let loginDetails = yield select(getLoginDetails);
  localStorage.setItem(ACCESS_TOKEN_PATH, loginDetails.access_token);
  localStorage.setItem(REFRESH_TOKEN_PATH, loginDetails.refresh_token);
  const validTill = dayjs()
    .add(loginDetails.expires_in, "second")
    .valueOf();
  localStorage.setItem(VALID_TILL, validTill);

  yield put(getUserInfo(loginDetails.access_token));
  const { success, failed } = yield race({
    success: take(GET_USER_INFO_SUCCESS),
    failed: take(GET_USER_INFO_FAILED),
  });

  if (success) {
    localStorage.setItem(USER_ID, success.data.result.id);
    localStorage.setItem(USER_ROLE, success.data.result.role);
    yield put(replace("/documents"));
  } else {
    localStorage.clear();
    yield put(showNotification('You\'re logged, Please login to continue'));
    yield delay(500);
    yield put(replace("/login"));
  }
}

function* updateTokens(action) {
  const { access_token, refresh_token, expires_in } = action.data.result;
  localStorage.setItem(ACCESS_TOKEN_PATH, access_token);
  localStorage.setItem(REFRESH_TOKEN_PATH, refresh_token);
  const validTill = dayjs()
    .add(expires_in, "second")
    .valueOf();
  localStorage.setItem(VALID_TILL, validTill);
  yield delay(100);
  yield put(updateTokenSuccess);
}

function* handleRefreshToken({ validTill, refreshToken }) {
  const to = dayjs(parseInt(validTill));
  const from = to.subtract(60, "second");
  const now = dayjs();

  if (!(now.isAfter(from) && now.isBefore(to))) {
    const timeout = from.valueOf() - now.valueOf();
    yield delay(timeout);
  }

  yield put(refreshAccessToken(refreshToken));
  yield take(UPDATE_TOKEN_SUCCESS);
  yield call(reValidate);
}

function* reValidate() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_PATH);
  const validTill = localStorage.getItem(VALID_TILL);
  if (validTill) {
    yield put(checkRefreshToken(validTill, refreshToken));
  }
}

function* loginSaga() {
  yield takeEvery(LOGIN_SUBMIT_SUCCESS, fetchUserInfo);
  yield takeEvery(REFRESH_TOKEN_SUCCESS, updateTokens);
  yield takeEvery(CHECK_REFRESH_TOKEN, handleRefreshToken);
}

export default loginSaga;
