import { NAVIGATION_DISABLE, NAVIGATION_ENABLE } from './actions'

export const navigationDefaultState = {
    disabled: false,
}

export const navigation = (state = navigationDefaultState, { type } = {}) => {
    if (type === NAVIGATION_DISABLE) {
        return { ...state, disabled: true }
    }

    if (type === NAVIGATION_ENABLE) {
        return { ...state, disabled: false }
    }

    return state
}
