import {combineReducers} from "redux";
import account from './account';
import {persistReducer} from "redux-persist";
import storageSession from "redux-persist/lib/storage/session";
import {PersistConfig} from "redux-persist/es/types";
import users from "./users";

export const reducers = combineReducers({account, users});

const persistConfig: PersistConfig<any> = {
    key: "root",
    storage: storageSession,
    whitelist: ["account"]
};

export default persistReducer(persistConfig, reducers)
