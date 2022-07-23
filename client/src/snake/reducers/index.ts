import {combineReducers} from "redux";
import room from "./room";
import multi from "./multi";
import account from './account';
import {persistReducer} from "redux-persist";
import storageSession from "redux-persist/lib/storage/session";
import {PersistConfig} from "redux-persist/es/types";

export const reducers = combineReducers({
    room, multi, account
});

const persistConfig: PersistConfig<any> = {
    key: "root",
    storage: storageSession,
    whitelist: ["account"]
};

export default persistReducer(persistConfig, reducers)