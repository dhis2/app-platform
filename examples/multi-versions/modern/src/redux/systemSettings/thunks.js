import {
    loadingSystemSettingsError,
    setSystemSettings,
    startLoadingSystemSettings,
} from './actions'

const SYSTEM_SETTINGS_QUERY = { systemSettings: { resource: 'systemSettings' } }

export const loadSystemSettings = () => (dispatch, getState, { engine }) => {
    dispatch(startLoadingSystemSettings())

    return engine
        .query(SYSTEM_SETTINGS_QUERY)
        .then(({ systemSettings }) =>
            dispatch(setSystemSettings(systemSettings))
        )
        .catch(({ message }) => dispatch(loadingSystemSettingsError(message)))
}
