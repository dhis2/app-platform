import store from '../store'
import { YEAR, MONTH, WEEK, DAY } from '../constants/intervals'
import i18n from '@dhis2/d2-i18n'

const dateFormats = {
    yyyymmdd: {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    },
    yyyymm: {
        month: 'short',
        year: 'numeric',
    },
}

const weekStr = i18n.t('Week')

export function getDisplayDateForInterval(
    { year, month, week, day },
    interval
) {
    switch (interval) {
        case YEAR:
            return year
        case MONTH:
            return getDisplayDateFromIsoString(
                `${year}-${month}`,
                dateFormats.yyyymm
            )
        case WEEK:
            return `${weekStr} ${week} / ${year}`
        case DAY:
        default:
            return getDisplayDateFromIsoString(`${year}-${month}-${day}`)
    }
}

export function getDisplayDateFromIsoString(
    isoString,
    dateFormatOptions = dateFormats.yyyymmdd
) {
    const state = store.getState()
    const locale = state.locale || 'en'
    const date = new Date(isoString)
    return new Intl.DateTimeFormat(locale, dateFormatOptions).format(date)
}
