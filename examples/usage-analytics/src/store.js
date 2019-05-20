import { createStore, applyMiddleware, combineReducers } from 'redux'
import ReduxThunk from 'redux-thunk'
import logger from 'redux-logger'
import appStatus from './reducers/appStatus'
import locale from './reducers/locale'
import usageData from './reducers/usageData'
import filter from './reducers/filter'

const middlewares = [ReduxThunk]

const shouldLog = false

if (process.env.NODE_ENV === 'development' && shouldLog) {
    middlewares.push(logger)
}

const rootReducer = combineReducers({
    appStatus,
    locale,
    usageData,
    filter,
})

export default createStore(rootReducer, applyMiddleware(...middlewares))
