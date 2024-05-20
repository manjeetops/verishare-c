import {
  SHOW_NOTIFICATION,
  HIDE_NOTIFICATION,
  SHOW_LOADER,
  HIDE_LOADER,
} from '../actions/app.actions';

const initialState = {
  notification: {
    variant: 'success',
    message: '',
  },
  loader: {
    open: false,
    title: undefined,
  },
  query: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SHOW_NOTIFICATION:
      return {
        ...state,
        notification: action.payload,
      };

    case HIDE_NOTIFICATION:
      return {
        ...state,
        notification: {
          ...initialState.notification,
          variant: state.notification.variant,
        },
      };

    case SHOW_LOADER:
      return {
        ...state,
        loader: {
          titie: action.payload,
          open: true,
        },
      };

    case HIDE_LOADER:
      return {
        ...state,
        loader: initialState.loader,
      };

    // case LOCATION_CHANGE:
    //   let query = { ...state.query };
    //   try {
    //     query = qs.parse(action.payload.location.search);
    //   } catch (e) {
    //     console.log('------errror---------------', e);
    //   }

    //   return {
    //     ...state,
    //     query,
    //   };

    default:
      return state;
  }
};
