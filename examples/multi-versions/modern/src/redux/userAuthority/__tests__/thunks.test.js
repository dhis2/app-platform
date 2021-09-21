jest.mock('../../configureStore')

import { configureStore } from '../../configureStore'
import {
    loadingUserAuthoritiesError,
    setUserAuthorities,
    startLoadingUserAuthorities,
} from '../actions'
import { loadUserAuthorities } from '../thunks'

const userAuthorities = ['F_FOO_PUBLIC_CREATE']

describe('loadUserAuthorities', () => {
    const engine = {
        query: jest.fn(() => Promise.resolve({ userAuthorities })),
    }
    const store = configureStore(engine)

    beforeEach(() => {
        store.clearActions()
    })

    afterEach(() => {
        engine.query.mockClear()
    })

    it('should dispatch a loading user authorities start action', done => {
        const expectedActions = expect.arrayContaining([
            startLoadingUserAuthorities(),
        ])

        store.dispatch(loadUserAuthorities()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
            done()
        })
    })

    it('should dispatch a set userAuthorities action when done loading', done => {
        const expectedActions = expect.arrayContaining([
            setUserAuthorities(userAuthorities),
        ])

        store.dispatch(loadUserAuthorities()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
            done()
        })
    })

    it('should dispatch a loading userAuthorities error action when an error occurred', done => {
        const error = 'An error occurred'
        engine.query.mockImplementationOnce(() =>
            Promise.reject(new Error(error))
        )
        const expectedActions = expect.arrayContaining([
            loadingUserAuthoritiesError(error),
        ])

        store.dispatch(loadUserAuthorities()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
            done()
        })
    })
})
