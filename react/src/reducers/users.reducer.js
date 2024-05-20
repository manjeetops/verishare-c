import {
  GET_ORGANIZATIONS_FAILED,
  GET_ORGANIZATIONS_REQUEST,
  GET_ORGANIZATIONS_SUCCESS,
  GET_USERS_FAILED,
  GET_USERS_REQUEST,
  GET_USERS_SUCCESS
} from '../actions/users.actions';

const initialState = {
  organizations: null,
  organizationsFetched: null,
  loading: null,
  error: null,
  isSuccess: null,
  usersLoading: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_ORGANIZATIONS_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case GET_ORGANIZATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        organizationsFetched: true,
        organizations: action.data.result
      };

    case GET_ORGANIZATIONS_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
        organizations: initialState.organizations
      };

    case GET_USERS_REQUEST:
      return {
        ...state,
        usersLoading: true,
      };

    case GET_USERS_SUCCESS:
      const organizations =  state.organizations
      
      const users = action.data.result

      let finished = true;
      organizations.forEach(organization => {
        if (organization.id === users[0].organizationId) {
          organization.users = users
        }
        if (!organization.users || organization.users.length === 0) {
          finished = false
        }
      })

      return {
        ...state,
        usersLoading: false,
        error: null,
        isSuccess: finished,
        organizations: organizations,
      };

    case GET_USERS_FAILED:
      return {
        ...state,
        usersLoading: false,
        error: action.payload,
        organizations: initialState.organizations,
      };

    default:
      return state;
  }
}
