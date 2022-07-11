import {applyMiddleware, bindActionCreators, compose, legacy_createStore as createStore} from "redux";
import ReduxThunk from "redux-thunk";
import reducers from "../snake/reducers";


const reduxMiddleware = [applyMiddleware(ReduxThunk)];
const store = createStore(reducers, compose(...reduxMiddleware));
export default store;
export type RootState = ReturnType<typeof store.getState>


export const bind = (actions) => bindActionCreators(actions, store.dispatch);
