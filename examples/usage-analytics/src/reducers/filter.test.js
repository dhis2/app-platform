import { FILTER_UPDATED } from '../actions/types'
import reducer, { getInitialState, parseDate } from './filter'
import { FAVORITE_VIEWS } from '../constants/categories'
import { WEEK } from '../constants/intervals'
import { SUM } from '../constants/aggregations'
import { ALL } from '../constants/chartTypes'
import { CHART_VIEW } from '../constants/eventTypes'
import { ASC } from '../constants/sortOrders'

describe('filter reducer', () => {
    const initialState = getInitialState(new Date())
    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual(initialState)
    })
    it('should handle FILTER_UPDATED', () => {
        const payload = {
            key: 'pageSize',
            value: 10,
        }
        const expectedState = {
            ...initialState,
            pageSize: 10,
        }
        expect(reducer(undefined, { type: FILTER_UPDATED, payload })).toEqual(
            expectedState
        )
    })
    it('getInitialState produces the correct initialState', () => {
        const endDateStr = '2018-12-21'
        const expectedInitalState = {
            category: FAVORITE_VIEWS,
            startDate: '2018-08-21',
            endDate: endDateStr,
            interval: WEEK,
            aggregationLevel: SUM,
            chartType: ALL,
            eventType: CHART_VIEW,
            pageSize: 25,
            sortOrder: ASC,
        }
        const actualInitialState = getInitialState(new Date(endDateStr))
        expect(actualInitialState).toEqual(expectedInitalState)
    })
    it('parseDate prepends months and days with a single digit with zero', () => {
        expect(parseDate(new Date('2018-1-1'))).toEqual('2018-01-01')
    })
})
