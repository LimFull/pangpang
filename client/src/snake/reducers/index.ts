import {combineReducers} from "redux";
import room from "./room";
import multi from "./multi";

const reducers = combineReducers({
    room, multi
});

export default reducers