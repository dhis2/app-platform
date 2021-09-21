import {
    loadingUserAuthoritiesError,
    setUserAuthorities,
    startLoadingUserAuthorities,
} from '../actions'
import {
    userAuthorities as reducer,
    userAuthoritiesDefaultState as defaultState,
} from '../reducer'

const userAuthorities = ['F_FOO_PUBLIC_CREATE']

describe('Reducer', () => {
    it('should return the state if an unknown action has been dispatched', () => {
        const state = { ...defaultState }
        const action = { type: 'UNKNOWN_ACTION' }
        const expected = defaultState
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })

    it('should set the loaded state to true when it is false and a setUserAuthorities action has been dispatched', () => {
        const state = { ...defaultState, loaded: false }
        const action = setUserAuthorities(userAuthorities)
        const expected = expect.objectContaining({ loaded: true })
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })

    it('should not override the loaded state to true when it is true and userAuthorities are being loaded again', () => {
        const state = { ...defaultState, loaded: true }
        const action = startLoadingUserAuthorities()
        const expected = expect.objectContaining({ loaded: true })
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })

    it('should set loading to true and error to null when starting to load userAuthorities', () => {
        const state = {
            ...defaultState,
            loading: false,
            error: 'Previous error',
        }
        const action = startLoadingUserAuthorities()
        const expected = { ...state, loading: true, error: null }
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })

    it('should set loading to false and override the data when a setUserAuthorities action has been dispatched', () => {
        const state = {
            ...defaultState,
            loaded: true,
            loading: true,
            data: null,
        }
        const action = setUserAuthorities(userAuthorities)
        const expected = { ...state, loading: false, data: userAuthorities }
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })

    it('should set the error and loading to false when a load userAuthorities error action is dispatched', () => {
        const error = 'An error occureed'
        const state = { ...defaultState, loading: true, error: null }
        const action = loadingUserAuthoritiesError(error)
        const expected = { ...state, loading: false, error }
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })
})
