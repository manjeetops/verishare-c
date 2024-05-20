import { takeEvery, put, select } from 'redux-saga/effects';
import { GET_ORGANIZATIONS_SUCCESS, getUsers } from '../actions/users.actions';

export const getOrganizations = (state) => state.users.organizations

// TODO: How the success is identified ?
function* getOrgUsers() {
  const organizations = yield select(getOrganizations);
  for(let i =0; i<organizations.length; i++) {
    yield put(getUsers(organizations[i].id))
  }
}

function* usersSaga() {
  yield takeEvery(GET_ORGANIZATIONS_SUCCESS, getOrgUsers);
}

export default usersSaga;




