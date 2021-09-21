import {
    SYSTEM_SETTINGS_LOAD_ERROR,
    SYSTEM_SETTINGS_LOAD_START,
    SYSTEM_SETTINGS_SET,
} from './actions'

export const systemSettingsDefaultState = {
    loading: false,
    loaded: false,
    error: null,
    data: null,
}

export const systemSettings = (
    state = systemSettingsDefaultState,
    { type, payload } = {}
) => {
    if (type === SYSTEM_SETTINGS_LOAD_START) {
        return { ...state, loading: true, error: null }
    }

    if (type === SYSTEM_SETTINGS_LOAD_ERROR) {
        return { ...state, loading: false, error: payload.error }
    }

    if (type === SYSTEM_SETTINGS_SET) {
        return {
            ...state,
            loading: false,
            loaded: true,
            data: payload.systemSettings,
        }
    }

    return state
}
