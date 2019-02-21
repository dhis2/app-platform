import { LOADING, ERROR } from '../constants/statuses'
import {
    APP_LOAD_SUCCESS,
    USAGE_DATA_REQUESTED,
    USAGE_DATA_RECEIVED,
    USAGE_DATA_ERRORED,
} from '../actions/types'
import reducer from './usageData'
import { dataStatistics } from '../__mockData__/usageData'

const usageData = dataStatistics

describe('usageData reducer', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual(LOADING)
    })
    it('should handle USAGE_DATA_REQUESTED', () => {
        expect(reducer(undefined, { type: USAGE_DATA_REQUESTED })).toEqual(
            LOADING
        )
    })
    it('should handle APP_LOAD_SUCCESS', () => {
        const payload = { usageData }
        expect(reducer(undefined, { type: APP_LOAD_SUCCESS, payload })).toEqual(
            usageData
        )
    })
    it('should handle USAGE_DATA_RECEIVED', () => {
        const payload = usageData
        expect(
            reducer(undefined, { type: USAGE_DATA_RECEIVED, payload })
        ).toEqual(usageData)
    })
    it('should handle USAGE_DATA_ERRORED', () => {
        expect(reducer(undefined, { type: USAGE_DATA_ERRORED })).toEqual(ERROR)
    })
})
