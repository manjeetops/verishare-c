import { createStore } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import createSagaMiddleware from "redux-saga";
import logger from "redux-logger";
import rootReducer from "../reducers";

const persistConfig = {
  blacklist: ["form"],
  key: "reactreduxform",
  storage
};
const sagaMiddleware = createSagaMiddleware();

const persistedReducer = persistReducer(persistConfig, rootReducer);

const middleware = [sagaMiddleware];

if (process.env.NODE_ENV === "development") {
  middleware.push(logger);
}

const store = createStore(persistedReducer, middleware);
const persistor = persistStore(store);

export { store, persistor };
