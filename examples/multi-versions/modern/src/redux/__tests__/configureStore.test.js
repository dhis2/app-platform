import thunk from 'redux-thunk'
import * as redux from 'redux'

import { rootReducer } from '../rootReducer'
import { configureStore } from '../configureStore'

// mock only applyMiddleware and compose, leave createStore intact
jest.unmock('redux')
redux.applyMiddleware = jest.fn(middleware => () => () => middleware)
redux.compose = jest.fn(middleware => middleware)
jest.spyOn(redux, 'createStore')
const { applyMiddleware, compose, createStore } = redux

jest.mock('redux-thunk', () => ({
    __esModule: true,
    default: (() => {
        const defaultModule = jest.fn()
        defaultModule.withExtraArgument = jest.fn()
        return defaultModule
    })(),
}))

jest.mock('../rootReducer', () => ({
    rootReducer: jest.fn(),
}))

describe('configureStore', () => {
    const engine = {}
    const extraArgument = { engine }
    const initialState = { foo: 'bar' }
    const reduxDevtoolsExtensionCompose = jest.fn(middleware => middleware)

    afterEach(() => {
        applyMiddleware.mockClear()
        compose.mockClear()
        createStore.mockClear()
        thunk.mockClear()
        thunk.withExtraArgument.mockClear()
        rootReducer.mockClear()
    })

    it('should not use the redux dev tools extension when available', () => {
        configureStore(engine, initialState)
        expect(compose).toBeCalledTimes(1)
        expect(reduxDevtoolsExtensionCompose).toBeCalledTimes(0)
    })

    it('should use the redux dev tools extension when available', () => {
        global.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = reduxDevtoolsExtensionCompose

        configureStore(engine, initialState)
        expect(compose).toBeCalledTimes(0)
        expect(reduxDevtoolsExtensionCompose).toBeCalledTimes(1)

        // clean up
        delete global.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    })

    it('should use redux-thunk with the engine as extra argument', () => {
        configureStore(engine, initialState)
        expect(thunk.withExtraArgument).toBeCalledWith(extraArgument)
        expect(thunk).toBeCalledTimes(0)
    })

    it('should create the store with the thunk middleware', () => {
        thunk.withExtraArgument.mockImplementationOnce(() => 'thunkMiddleware')

        configureStore(engine, initialState)
        expect(createStore).toBeCalledTimes(1)

        const callArguments = createStore.mock.calls[0]
        const middlewareArgument = callArguments[2]
        expect(typeof middlewareArgument).toBe('function')

        // the composeEnhancer returns an enhancer which is a function
        // that returns a function which in the end will return the final
        // middleware, hence the "middlewareArgument" needs to be called
        // twice in order to get the mocked value
        const middlewareValue = middlewareArgument()()
        expect(middlewareValue).toBe('thunkMiddleware')
    })

    it('should create the store with the initialState', () => {
        configureStore(engine, initialState)
        expect(createStore).toBeCalledTimes(1)

        const callArguments = createStore.mock.calls[0]
        const initialStateArgument = callArguments[1]
        expect(initialStateArgument).toEqual(initialState)
    })

    it('should create the store with the rootReducer', () => {
        configureStore(engine, initialState)
        expect(createStore).toBeCalledTimes(1)

        const callArguments = createStore.mock.calls[0]
        const rootReducerArgument = callArguments[0]
        expect(rootReducerArgument).toEqual(rootReducer)
    })
})
