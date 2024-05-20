import axios from 'axios';
import { takeEvery, put } from 'redux-saga/effects';
import { CALL_API } from '../actions/api.actions';
import { showLoader, hideLoader, showNotification } from '../actions/app.actions'
import config from '../config';
import { ACCESS_TOKEN_PATH,REFRESH_TOKEN_PATH } from '../constants';
import {logoutUser} from '../actions/logout.actions';

const identifyErrors = (status, body) => {
  if (status < 200 || status > 400) {
    throw new Error('Failed to fetch response from server');
  }

  if (body.error || body.errors) {
    throw new Error(body.error || body.errors);
  }
}

const getHeaders = (overrides = {}) => {
  const token = localStorage.getItem(ACCESS_TOKEN_PATH)
  return {
    "Content-Type": 'application/json',
    "authorization": token ? `Bearer ${token}` : null,
    ...overrides,
  };
};

export function* apiSaga(action) {
  const [request, success, failure] = action.types;
  const requestUrl = `${config.get('server.baseUrl')}${action.endPoint}`;

  const requestBody = action.body || {};
  const requestConfig = {
    headers: getHeaders(),
  };

  yield put({ type: request, body: requestBody });
  if (action.showLoader) {
    yield put(showLoader());
  }

  const args = ['get', 'delete'].includes(action.method)
    ? [requestUrl, requestConfig]
    : [requestUrl, requestBody, requestConfig];

  try {
    const response = yield axios[action.method](...args);
    yield identifyErrors(response.status, response.data);
    const responseData = response.data.data || response.data;
    yield put({ type: success, data: responseData });
    if (action.notificationOpts && action.notificationOpts.success) {
      yield put(showNotification(
        action.notificationOpts.success.message || 'Request successfully processed.',
        { variant: 'success' },
      ));
    }
  } catch (error) {
    let payload = error;
    if (error.response && error.response.data) {
      payload = error.response.data;
    }

    if(error.response && error.response.status === 403) {
      yield put(logoutUser(localStorage.getItem(REFRESH_TOKEN_PATH)));
    }

    yield put({ type: failure, payload });
    if (action.notificationOpts && action.notificationOpts.error && payload.message) {
      yield put(showNotification(payload.message, action.notificationOpts.error));
    }
  } finally {
    if (action.showLoader) {
      yield put(hideLoader());
    }
  }
}

export default function* () {
  yield takeEvery(CALL_API, apiSaga);
}
