import { LOADING, READY, ERROR } from '../constants/statuses'
import { APP_LOAD_SUCCESS, APP_LOAD_ERROR } from '../actions/types'
import reducer from './appStatus'

describe('appStatus reducer', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual(LOADING)
    })
    it('should handle APP_LOAD_SUCCESS', () => {
        expect(reducer(undefined, { type: APP_LOAD_SUCCESS })).toEqual(READY)
    })
    it('should handle APP_LOAD_ERROR', () => {
        expect(reducer(undefined, { type: APP_LOAD_ERROR })).toEqual(ERROR)
    })
})
