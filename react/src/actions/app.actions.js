import { createAction } from 'redux-actions';

export const SHOW_NOTIFICATION = 'auth/SHOW_NOTIFICATION';
export const HIDE_NOTIFICATION = 'auth/HIDE_NOTIFICATION';
export const SHOW_LOADER = 'auth/SHOW_LOADER';
export const HIDE_LOADER = 'auth/HIDE_LOADER';

export const showNotification = createAction(
  SHOW_NOTIFICATION,
  (message = '', { timeout = 6000, variant = 'success' } = {}) => ({
    variant,
    message,
    timeout,
    open: true,
  }),
);

export const hideNotification = createAction(HIDE_NOTIFICATION);

export const showLoader = createAction(SHOW_LOADER);
export const hideLoader = createAction(HIDE_LOADER);
