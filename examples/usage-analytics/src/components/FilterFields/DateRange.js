import React, { Component } from 'react'
import PropTypes from 'prop-types'
import i18n from '@dhis2/d2-i18n'
import debounce from 'lodash.debounce'
import './DateRange.css'

export const START_DATE = 'startDate'
export const END_DATE = 'endDate'
export const ERROR_PATTERN = i18n.t('Please use the format yyyy-mm-dd')
export const ERROR_END_BEFORE_START = i18n.t('End date is before start date')
export const ERROR_START_AFTER_END = i18n.t('Start date is after end date')

// Very basic date input. If browser doesn't support input type date,
// it will use the pattern validation to display an error
class DateRange extends Component {
    constructor(props) {
        super(props)
        this.state = {
            startDateError: null,
            endDateError: null,
        }
        this.onStartDateChange = this.onStartDateChange.bind(this)
        this.onEndDateChange = this.onEndDateChange.bind(this)
        this.updateUsageData = debounce(props.updateUsageData, 250)
    }

    onStartDateChange(event) {
        this.onChange(START_DATE, event.target.value)
    }
    onEndDateChange(event) {
        this.onChange(END_DATE, event.target.value)
    }

    onChange(key, value) {
        const { updateFilter, updateUsageData, ...dateRange } = this.props
        const errorKey = `${key}Error`
        const otherErrorKey =
            key === START_DATE ? `${END_DATE}Error` : `${START_DATE}Error`
        const error = this.getError({ ...dateRange, [key]: value }, key)
        const otherError =
            this.state[otherErrorKey] === ERROR_PATTERN ? ERROR_PATTERN : null

        if (this.state[errorKey] !== error) {
            this.setState({
                [errorKey]: error,
                [otherErrorKey]: otherError,
            })
        }

        updateFilter(key, value)

        if (!error) {
            this.updateUsageData()
        }
    }

    getError(dateRange, key) {
        if (!/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(dateRange[key])) {
            return ERROR_PATTERN
        }

        if (dateRange.endDate < dateRange.startDate) {
            return key === START_DATE
                ? ERROR_START_AFTER_END
                : ERROR_END_BEFORE_START
        }

        return null
    }

    render() {
        const { startDate, endDate } = this.props
        const { startDateError, endDateError } = this.state

        return (
            <div className="uaa-date-range">
                <div className="uaa-date-field uaa-fieldwrap">
                    <label>{i18n.t('Start Date')}</label>
                    <input
                        className={START_DATE}
                        type="date"
                        value={startDate}
                        onChange={this.onStartDateChange}
                    />
                    {startDateError && (
                        <span className={`uaa-date-input-error ${START_DATE}`}>
                            {startDateError}
                        </span>
                    )}
                </div>
                <div className="uaa-date-field uaa-fieldwrap">
                    <label>{i18n.t('End date')}</label>
                    <input
                        className={END_DATE}
                        type="date"
                        value={endDate}
                        onChange={this.onEndDateChange}
                    />
                    {endDateError && (
                        <span className={`uaa-date-input-error ${END_DATE}`}>
                            {endDateError}
                        </span>
                    )}
                </div>
            </div>
        )
    }
}

DateRange.propTypes = {
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    updateFilter: PropTypes.func.isRequired,
    updateUsageData: PropTypes.func.isRequired,
}

export default DateRange
