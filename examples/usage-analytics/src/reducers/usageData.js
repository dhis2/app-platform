import { LOADING, ERROR } from '../constants/statuses'
import {
    APP_LOAD_SUCCESS,
    USAGE_DATA_REQUESTED,
    USAGE_DATA_RECEIVED,
    USAGE_DATA_ERRORED,
} from '../actions/types'

export default function usageData(state = LOADING, { type, payload }) {
    switch (type) {
        case USAGE_DATA_REQUESTED:
            return LOADING
        case APP_LOAD_SUCCESS:
            return payload.usageData
        case USAGE_DATA_RECEIVED:
            return payload
        case USAGE_DATA_ERRORED:
            return ERROR
        default:
            return state
    }
}
