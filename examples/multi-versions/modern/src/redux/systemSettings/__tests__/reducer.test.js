import {
    loadingSystemSettingsError,
    setSystemSettings,
    startLoadingSystemSettings,
} from '../actions'
import {
    systemSettings as reducer,
    systemSettingsDefaultState as defaultState,
} from '../reducer'

const systemSettings = { keyRequireAddToView: true }

describe('Reducer', () => {
    it('should return the state if an unknown action has been dispatched', () => {
        const state = { ...defaultState }
        const action = { type: 'UNKNOWN_ACTION' }
        const expected = defaultState
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })

    it('should set the loaded state to true when it is false and a setSystemSettings action has been dispatched', () => {
        const state = { ...defaultState, loaded: false }
        const action = setSystemSettings(systemSettings)
        const expected = expect.objectContaining({ loaded: true })
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })

    it('should not override the loaded state to true when it is true and systemSettings are being loaded again', () => {
        const state = { ...defaultState, loaded: true }
        const action = startLoadingSystemSettings()
        const expected = expect.objectContaining({ loaded: true })
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })

    it('should set loading to true and error to null when starting to load systemSettings', () => {
        const state = {
            ...defaultState,
            loading: false,
            error: 'Previous error',
        }
        const action = startLoadingSystemSettings()
        const expected = { ...state, loading: true, error: null }
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })

    it('should set loading to false and override the data when a setSystemSettings action has been dispatched', () => {
        const state = {
            ...defaultState,
            loaded: true,
            loading: true,
            data: null,
        }
        const action = setSystemSettings(systemSettings)
        const expected = { ...state, loading: false, data: systemSettings }
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })

    it('should set the error and loading to false when a load systemSettings error action is dispatched', () => {
        const error = 'An error occureed'
        const state = { ...defaultState, loading: true, error: null }
        const action = loadingSystemSettingsError(error)
        const expected = { ...state, loading: false, error }
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })
})
