import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { CircularProgress } from '@dhis2/ui/core/CircularProgress'
import { FAVORITE_VIEWS } from '../constants/categories'
import { TABLE_FIELDS as FIELDS } from '../constants/fields'
import {
    date as dateField,
    created as createdField,
} from '../constants/properties'
import { ERROR, LOADING } from '../constants/statuses'
import Error from './Error'
import {
    getDisplayDateForInterval,
    getDisplayDateFromIsoString,
} from '../utils/date'
import './Table.css'

const baseClassName = 'uua-data-container'
const loadingClassName = ' uua-data-container--loading'

export const TableHead = ({ headers }) => (
    <thead>
        <tr>
            {headers.map((header, i) => (
                <th key={`h-${i}`}>{header}</th>
            ))}
        </tr>
    </thead>
)

export const TableBody = ({ rows }) => (
    <tbody>
        {rows.map((row, i) => (
            <TableRow key={`row-${i}`} cells={row} />
        ))}
    </tbody>
)

export const TableRow = ({ cells }) => (
    <tr>
        {cells.map((text, i) => (
            <td key={`cell-${i}`}>{text}</td>
        ))}
    </tr>
)

export function Table({ error, loading, tableData }) {
    let content

    if (error) {
        content = (
            <Error
                message={i18n.t(
                    'There was an error retrieving the usage analytics data'
                )}
            />
        )
    } else if (loading) {
        content = <CircularProgress overlay />
    } else {
        const { headers, rows } = tableData
        content = (
            <table className="uaa-data-table">
                <TableHead headers={headers} />
                <TableBody rows={rows} />
            </table>
        )
    }

    const className = loading ? baseClassName + loadingClassName : baseClassName

    return <div className={className}>{content}</div>
}

Table.propTypes = {
    error: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    tableData: PropTypes.object,
}

TableHead.propTypes = {
    headers: PropTypes.arrayOf(PropTypes.string).isRequired,
}

TableBody.propTypes = {
    rows: PropTypes.arrayOf(PropTypes.array).isRequired,
}

TableRow.propTypes = {
    cells: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ).isRequired,
}

export function mapStateToProps({ usageData, filter }) {
    const error = usageData === ERROR
    const loading = usageData === LOADING
    return {
        error,
        loading,
        tableData: loading || error ? null : parseTableData(filter, usageData),
    }
}

function parseTableData({ aggregationLevel, category, interval }, dataPoints) {
    const fields =
        category === FAVORITE_VIEWS
            ? FIELDS[category][aggregationLevel]
            : FIELDS[category]

    return {
        headers: fields.map(({ label }) => label),
        rows: dataPoints.map(dataPoint =>
            fields.map(field => {
                if (field.key === dateField.key) {
                    return getDisplayDateForInterval(dataPoint, interval)
                }
                if (field.key === createdField.key) {
                    return getDisplayDateFromIsoString(dataPoint[field.key])
                }
                return dataPoint[field.key]
            })
        ),
    }
}

export default connect(mapStateToProps)(Table)
