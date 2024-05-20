import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { reducer as formReducer } from 'redux-form';
import app from './app.reducer'
import login from './login.reducer'
import doc from './doc.reducer'
import documentList from "./documentList.reducer";
import users from './users.reducer'
import transferHistory from './transferHistory.reducer'
import transferDocument from './transferDocument.reducer'
import invites from './invites.reducer'

const createRootReducer = history => combineReducers({
  router: connectRouter(history),
  form: formReducer,
  documentList,
  login,
  doc,
  app,
  users,
  transferHistory,
  transferDocument,
  invites
});

export default createRootReducer;
