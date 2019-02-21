import { connect } from 'react-redux'
import * as DropDowns from './dropDownComponents'
import DateRangeComponent from './DateRange'
import {
    updateCategory,
    updateFilterAndGetData,
    updateFilter,
    updateUsageData,
} from '../../actions'

export const CategoryDropDown = connect(
    createValueGetterForFilterKey('category'),
    { onChange: updateCategory }
)(DropDowns.Category)

export const DateRange = connect(
    mapDateRangeProps,
    { updateFilter, updateUsageData }
)(DateRangeComponent)

export const IntervalDropDown = connect(
    createValueGetterForFilterKey('interval'),
    { onChange: updateFilterAndGetData }
)(DropDowns.Interval)

export const AggregationLevelDropDown = connect(
    createValueGetterForFilterKey('aggregationLevel'),
    { onChange: updateFilter }
)(DropDowns.AggregationLevel)

export const ChartTypeDropDown = connect(
    createValueGetterForFilterKey('chartType'),
    { onChange: updateFilter }
)(DropDowns.ChartType)

export const EventTypeDropDown = connect(
    createValueGetterForFilterKey('eventType'),
    { onChange: updateFilterAndGetData }
)(DropDowns.EventType)

export const PageSizeDropDown = connect(
    createValueGetterForFilterKey('pageSize'),
    { onChange: updateFilterAndGetData }
)(DropDowns.PageSize)

export const SortOrderDropDown = connect(
    createValueGetterForFilterKey('sortOrder'),
    { onChange: updateFilterAndGetData }
)(DropDowns.SortOrder)

export function createValueGetterForFilterKey(key) {
    return function(state) {
        return {
            value: state.filter[key],
        }
    }
}

export function mapDateRangeProps(state) {
    return {
        startDate: state.filter.startDate,
        endDate: state.filter.endDate,
    }
}
