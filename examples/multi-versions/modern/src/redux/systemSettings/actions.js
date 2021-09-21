export const SYSTEM_SETTINGS_LOAD_START = 'SYSTEM_SETTINGS_LOAD_START'
export const startLoadingSystemSettings = () => ({
    type: SYSTEM_SETTINGS_LOAD_START,
})

export const SYSTEM_SETTINGS_LOAD_ERROR = 'SYSTEM_SETTINGS_LOAD_ERROR'
export const loadingSystemSettingsError = error => ({
    type: SYSTEM_SETTINGS_LOAD_ERROR,
    payload: { error },
})

export const SYSTEM_SETTINGS_SET = 'SYSTEM_SETTINGS_SET'
export const setSystemSettings = systemSettings => ({
    type: SYSTEM_SETTINGS_SET,
    payload: { systemSettings },
})
