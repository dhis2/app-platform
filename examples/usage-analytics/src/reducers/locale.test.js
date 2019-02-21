import { APP_LOAD_SUCCESS } from '../actions/types'
import reducer from './locale'

describe('locale reducer', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual(null)
    })
    it('should handle APP_LOAD_SUCCESS', () => {
        const locale = 'en'
        expect(
            reducer(undefined, { type: APP_LOAD_SUCCESS, payload: { locale } })
        ).toEqual(locale)
    })
})
