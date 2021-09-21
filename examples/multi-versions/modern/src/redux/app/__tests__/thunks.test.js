jest.mock('../../configureStore.js')

jest.mock('../../schemas/thunks', () => ({
    loadSchemas: jest.fn(() => dispatch => {
        dispatch({ type: 'LOAD_SCHEMAS' })
        return Promise.resolve()
    }),
}))

jest.mock('../../systemSettings/thunks', () => ({
    loadSystemSettings: jest.fn(() => dispatch => {
        dispatch({ type: 'LOAD_SYSTEM_SETTINGS' })
        return Promise.resolve()
    }),
}))

jest.mock('../../userAuthority/thunks', () => ({
    loadUserAuthorities: jest.fn(() => dispatch => {
        dispatch({ type: 'LOAD_USER_AUTHORITIES' })
        return Promise.resolve()
    }),
}))

import { configureStore } from '../../configureStore'
import { loadAppData } from '../thunks'

describe('loadAppData', () => {
    const store = configureStore()

    beforeEach(() => {
        store.clearActions()
    })

    it('should dispatch actions for loading initial data', done => {
        const expectedActions = expect.arrayContaining([
            { type: 'LOAD_SCHEMAS' },
            { type: 'LOAD_SYSTEM_SETTINGS' },
            { type: 'LOAD_USER_AUTHORITIES' },
        ])

        store.dispatch(loadAppData()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
            done()
        })
    })
})
