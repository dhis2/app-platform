import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

export const configureStore = (engine, initialState) =>
    configureMockStore([thunk.withExtraArgument({ engine })])(initialState)
