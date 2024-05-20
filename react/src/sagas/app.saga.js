import { put, select, call, delay, takeLatest, take } from 'redux-saga/effects';
import { getLocation } from 'connected-react-router';
import { replace } from 'react-router-redux';
import { ACCESS_TOKEN_PATH, REFRESH_TOKEN_PATH, VALID_TILL } from '../constants';
import { setTokens, getUserInfo, checkRefreshToken } from '../actions/login.actions';
import { SHOW_NOTIFICATION, hideNotification } from '../actions/app.actions';
import { GET_DOC_DETAILS_SUCCESS } from '../actions/doc.actions';

const publicRoutes = [
  '/login',
  '/signup'
];

function* handleRedirection(token) {
  const path = yield select(({ router }) => router.location.pathname);
  if (token) {
    if (publicRoutes.includes(path)) {
      yield put(replace('/documents'));
    }
  } else {
    if (!publicRoutes.includes(path) && path != '/signup') {
      yield put(replace('/login'));
    }
  }
}

function* hideNotificationSaga({ payload }) {
  yield delay(payload.timeout);
  yield put(hideNotification());
}

function* appSaga() {
  yield takeLatest(SHOW_NOTIFICATION, hideNotificationSaga);
  const accessToken = localStorage.getItem(ACCESS_TOKEN_PATH);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_PATH);
  const validTill = localStorage.getItem(VALID_TILL);
  yield call(handleRedirection, accessToken);

  if (validTill) {
    yield put(checkRefreshToken(validTill, refreshToken));
  }

  if (accessToken && refreshToken) {
    yield put(setTokens(accessToken, refreshToken));
    yield put(getUserInfo(accessToken));
  }

  const { pathname, query } = yield select(getLocation);
  if (pathname.includes('/doc/') && query.print === 'true') {
    yield take(GET_DOC_DETAILS_SUCCESS);
    yield delay(500);
    window.print();
    yield delay(10);
    window.close();
  }
}

export default appSaga;
