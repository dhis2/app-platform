import { YEAR, MONTH, WEEK, DAY } from '../constants/intervals'
import { getDisplayDateForInterval } from './date'

describe('getDisplayDateForInterval', () => {
    const dataPoint = {
        year: 2019,
        month: 1,
        week: 3,
        day: 14,
    }
    it('returns the correct value when interval is YEAR', () => {
        expect(getDisplayDateForInterval(dataPoint, YEAR)).toEqual(
            dataPoint.year
        )
    })
    it('returns the correct value when interval is MONTH', () => {
        expect(getDisplayDateForInterval(dataPoint, MONTH)).toEqual('Jan 2019')
    })
    it('returns the correct value when interval is WEEK', () => {
        expect(getDisplayDateForInterval(dataPoint, WEEK)).toEqual(
            'Week 3 / 2019'
        )
    })
    it('returns the correct value when interval is DAY', () => {
        expect(getDisplayDateForInterval(dataPoint, DAY)).toEqual(
            'Jan 14, 2019'
        )
    })
})
