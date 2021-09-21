export const getSystemSettings = state => state.systemSettings

export const getSystemSettingsLoading = state =>
    getSystemSettings(state).loading

export const getSystemSettingsLoaded = state => getSystemSettings(state).loaded

export const getSystemSettingsError = state => getSystemSettings(state).error

export const getSystemSettingsData = state => getSystemSettings(state).data
