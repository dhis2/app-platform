import {
    USER_AUTHORITIES_LOAD_ERROR,
    USER_AUTHORITIES_LOAD_START,
    USER_AUTHORITIES_SET,
} from './actions'

export const userAuthoritiesDefaultState = {
    loading: false,
    loaded: false,
    error: null,
    data: null,
}

export const userAuthorities = (
    state = userAuthoritiesDefaultState,
    { type, payload } = {}
) => {
    if (type === USER_AUTHORITIES_LOAD_START) {
        return { ...state, loading: true, error: null }
    }

    if (type === USER_AUTHORITIES_LOAD_ERROR) {
        return { ...state, loading: false, error: payload.error }
    }

    if (type === USER_AUTHORITIES_SET) {
        return {
            ...state,
            loading: false,
            loaded: true,
            data: payload.userAuthorities,
        }
    }

    return state
}
