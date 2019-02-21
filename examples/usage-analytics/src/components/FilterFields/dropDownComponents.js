import React from 'react'
import i18n from '@dhis2/d2-i18n'
import SelectField from '@dhis2/ui/core/SelectField'
import withMargin from './withMargin'

import CATEGORIES from '../../constants/categories'
import INTERVALS from '../../constants/intervals'
import AGGREGATIONS from '../../constants/aggregations'
import CHART_TYPES from '../../constants/chartTypes'
import EVENT_TYPES from '../../constants/eventTypes'
import PAGE_SIZES from '../../constants/pageSizes'
import SORT_ORDERS from '../../constants/sortOrders'

const FIELD_KIND = 'filled'

const SelectFieldWithMargin = withMargin(SelectField)

export const Category = props => (
    <SelectFieldWithMargin
        {...props}
        name="category"
        list={CATEGORIES}
        label={i18n.t('Category')}
        kind={FIELD_KIND}
    />
)

export const Interval = props => (
    <SelectFieldWithMargin
        {...props}
        name="interval"
        list={INTERVALS}
        label={i18n.t('Interval')}
        kind={FIELD_KIND}
    />
)

export const AggregationLevel = props => (
    <SelectFieldWithMargin
        {...props}
        name="aggregationLevel"
        list={AGGREGATIONS}
        label={i18n.t('Aggregation Level')}
        kind={FIELD_KIND}
    />
)

export const ChartType = props => (
    <SelectFieldWithMargin
        {...props}
        name="chartType"
        list={CHART_TYPES}
        label={i18n.t('Chart Type')}
        kind={FIELD_KIND}
    />
)

export const EventType = props => (
    <SelectFieldWithMargin
        {...props}
        name="eventType"
        list={EVENT_TYPES}
        label={i18n.t('Event Type')}
        kind={FIELD_KIND}
    />
)

export const PageSize = props => (
    <SelectFieldWithMargin
        {...props}
        name="pageSize"
        list={PAGE_SIZES}
        label={i18n.t('Page Size')}
        kind={FIELD_KIND}
    />
)

export const SortOrder = props => (
    <SelectFieldWithMargin
        {...props}
        name="sortOrder"
        list={SORT_ORDERS}
        label={i18n.t('Sort Order')}
        kind={FIELD_KIND}
    />
)
