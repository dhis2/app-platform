import { APP_LOAD_SUCCESS } from '../actions/types'

export default function locale(state = null, { type, payload }) {
    switch (type) {
        case APP_LOAD_SUCCESS:
            return payload.locale
        default:
            return state
    }
}
