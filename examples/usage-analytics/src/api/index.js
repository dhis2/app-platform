import { get } from '@dhis2/ui/utils/api'
import { setLocale } from '../utils/locale'
import { TOP_FAVORITES } from '../constants/categories'

const api = {
    initApp,
    getUsageData,
    getFavorites,
    getDataStatistics,
    getUserLocale,
    getJSON,
    handleJSON,
}

export function initApp({ filter }) {
    return Promise.all([api.getUserLocale(), api.getUsageData(filter)]).then(
        ([locale, usageData]) => {
            setLocale(locale)
            return {
                usageData,
                locale,
            }
        }
    )
}

export function getUsageData(filter) {
    return filter.category === TOP_FAVORITES
        ? api.getFavorites(filter)
        : api.getDataStatistics(filter)
}

export function getFavorites({ eventType, pageSize, sortOrder }) {
    const queryParams = `eventType=${eventType}&pageSize=${pageSize}&sortOrder=${sortOrder}&_=${Date.now()}`
    return api.getJSON(`dataStatistics/favorites?${queryParams}`)
}

export function getDataStatistics({ startDate, endDate, interval }) {
    const queryParams = `startDate=${startDate}&endDate=${endDate}&interval=${interval}&_=${Date.now()}`
    return api.getJSON(`dataStatistics?${queryParams}`)
}

export function getUserLocale() {
    return api
        .getJSON('userSettings')
        .then(userSettings => userSettings.keyUiLocale)
}

export function getJSON(path) {
    return get(path)
        .then(response => response.json())
        .then(handleJSON)
}

export function handleJSON(json) {
    if (json.status === 'ERROR') {
        throw new Error(json.message)
    } else {
        return json
    }
}

export default api
