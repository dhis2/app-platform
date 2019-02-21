import i18n from '@dhis2/d2-i18n'

export const ALL = 'ALL'
export const TOTAL = 'TOTAL'

const CHART_TYPES = [
    { value: ALL, label: i18n.t('All') },
    { value: TOTAL, label: i18n.t('Total') },
]
export default CHART_TYPES
