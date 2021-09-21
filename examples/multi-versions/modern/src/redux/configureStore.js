import { applyMiddleware, compose, createStore } from 'redux'
import { createBrowserHistory } from 'history'
import thunk from 'redux-thunk'

import { rootReducer } from './rootReducer'

export const history = createBrowserHistory()

export const configureStore = (engine, initialState) => {
    const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        : compose

    const thunkMiddleware = thunk.withExtraArgument({ engine })
    const middleware = composeEnhancer(applyMiddleware(thunkMiddleware))
    const store = createStore(rootReducer, initialState, middleware)

    return store
}
