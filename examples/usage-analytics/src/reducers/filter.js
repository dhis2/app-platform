import { FILTER_UPDATED } from '../actions/types'
import { FAVORITE_VIEWS } from '../constants/categories'
import { WEEK } from '../constants/intervals'
import { SUM } from '../constants/aggregations'
import { ALL } from '../constants/chartTypes'
import { CHART_VIEW } from '../constants/eventTypes'
import { ASC } from '../constants/sortOrders'

export default function filter(
    state = getInitialState(new Date()),
    { type, payload }
) {
    switch (type) {
        case FILTER_UPDATED:
            return {
                ...state,
                [payload.key]: payload.value,
            }
        default:
            return state
    }
}

export function getInitialState(endDate) {
    const startDate = new Date(endDate.valueOf())
    startDate.setMonth(startDate.getMonth() - 4)

    return {
        category: FAVORITE_VIEWS,
        startDate: parseDate(startDate),
        endDate: parseDate(endDate),
        interval: WEEK,
        aggregationLevel: SUM,
        chartType: ALL,
        eventType: CHART_VIEW,
        pageSize: 25,
        sortOrder: ASC,
    }
}

export function parseDate(date) {
    let year = date.getFullYear()
    let month = '' + (date.getMonth() + 1)
    let day = '' + date.getDate()

    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day

    return [year, month, day].join('-')
}
