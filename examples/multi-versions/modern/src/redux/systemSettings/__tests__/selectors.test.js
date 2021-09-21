import {
    getSystemSettings,
    getSystemSettingsData,
    getSystemSettingsError,
    getSystemSettingsLoaded,
    getSystemSettingsLoading,
} from '../selectors'
import { systemSettingsDefaultState as defaultState } from '../reducer'

describe('Selectors', () => {
    const state = { systemSettings: defaultState }

    it('should get the systemSettings', () => {
        expect(getSystemSettings(state)).toEqual(defaultState)
    })

    it('should get the loading state', () => {
        expect(getSystemSettingsLoading(state)).toEqual(defaultState.loading)
    })

    it('should get the loaded state', () => {
        expect(getSystemSettingsLoaded(state)).toEqual(defaultState.loaded)
    })

    it('should get the error state', () => {
        expect(getSystemSettingsError(state)).toEqual(defaultState.error)
    })

    it('should get the data state', () => {
        expect(getSystemSettingsData(state)).toEqual(defaultState.data)
    })
})
