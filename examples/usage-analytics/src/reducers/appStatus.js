import { LOADING, READY, ERROR } from '../constants/statuses'
import { APP_LOAD_SUCCESS, APP_LOAD_ERROR } from '../actions/types'

export default function appStatus(state = LOADING, { type }) {
    switch (type) {
        case APP_LOAD_SUCCESS:
            return READY
        case APP_LOAD_ERROR:
            return ERROR
        default:
            return state
    }
}
