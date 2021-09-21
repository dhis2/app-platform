import { SCHEMAS_LOAD_ERROR, SCHEMAS_LOAD_START, SCHEMAS_SET } from './actions'

export const schemasDefaultState = {
    loading: false,
    loaded: false,
    error: null,
    data: null,
}

export const schemas = (
    state = schemasDefaultState,
    { type, payload } = {}
) => {
    if (type === SCHEMAS_LOAD_START) {
        return { ...state, loading: true, error: null }
    }

    if (type === SCHEMAS_LOAD_ERROR) {
        return { ...state, loading: false, error: payload.error }
    }

    if (type === SCHEMAS_SET) {
        return {
            ...state,
            loading: false,
            loaded: true,
            data: payload.schemas,
        }
    }

    return state
}
