import userId from "./userId";
import { createStore, applyMiddleware, combineReducers } from "redux";
import { location, epic } from "./navigation";
import { createEpicMiddleware } from "redux-observable";

const rootReducer = combineReducers({ userId, location });
const epicMiddleware = createEpicMiddleware(epic);

export default createStore(rootReducer, applyMiddleware(epicMiddleware));
