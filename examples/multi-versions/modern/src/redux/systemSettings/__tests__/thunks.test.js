jest.mock('../../configureStore')

import {
    loadingSystemSettingsError,
    setSystemSettings,
    startLoadingSystemSettings,
} from '../actions'
import { loadSystemSettings } from '../thunks'
import { configureStore } from '../../configureStore'

const systemSettings = { keyRequireAddToView: true }

describe('Thunk - loadSystemSettings', () => {
    const engine = { query: jest.fn(() => Promise.resolve({ systemSettings })) }
    const store = configureStore(engine)

    beforeEach(() => {
        store.clearActions()
    })

    afterEach(() => {
        engine.query.mockClear()
    })

    it('should dispatch a loading system settings start action', done => {
        const expectedActions = expect.arrayContaining([
            startLoadingSystemSettings(),
        ])

        store.dispatch(loadSystemSettings()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
            done()
        })
    })

    it('should dispatch a set systemSettings action when done loading', done => {
        const expectedActions = expect.arrayContaining([
            setSystemSettings(systemSettings),
        ])

        store.dispatch(loadSystemSettings()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
            done()
        })
    })

    it('should dispatch a loading systemSettings error action when an error occurred', done => {
        const error = 'An error occurred'
        engine.query.mockImplementationOnce(() =>
            Promise.reject(new Error(error))
        )
        const expectedActions = expect.arrayContaining([
            loadingSystemSettingsError(error),
        ])

        store.dispatch(loadSystemSettings()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
            done()
        })
    })
})
