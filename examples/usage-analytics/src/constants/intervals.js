import i18n from '@dhis2/d2-i18n'

export const DAY = 'DAY'
export const WEEK = 'WEEK'
export const MONTH = 'MONTH'
export const YEAR = 'YEAR'

const INTERVALS = [
    { value: DAY, label: i18n.t('Day') },
    { value: WEEK, label: i18n.t('Week') },
    { value: MONTH, label: i18n.t('Month') },
    { value: YEAR, label: i18n.t('Year') },
]
export default INTERVALS
