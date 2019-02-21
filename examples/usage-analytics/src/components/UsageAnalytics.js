import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import i18n from '@dhis2/d2-i18n'
import CircularProgress from '@dhis2/ui/core/CircularProgress'
import { LOADING, ERROR } from '../constants/statuses'
import { initApp } from '../actions'
import Error from './Error'
import FilterSideBar from './FilterSideBar'
import Chart from './Chart'
import Table from './Table'

export class UsageAnalytics extends Component {
    componentDidMount() {
        this.props.initApp()
    }

    render() {
        const { appStatus } = this.props

        if (appStatus === LOADING) {
            return <CircularProgress overlay size="large" />
        }

        if (appStatus === ERROR) {
            return <Error message={i18n.t('ERROR: Could not load app')} />
        }

        return (
            <main className="uaa-container">
                <FilterSideBar />
                <section className="uaa-content">
                    <Chart />
                    <Table />
                </section>
            </main>
        )
    }
}

UsageAnalytics.propTypes = {
    initApp: PropTypes.func,
    appStatus: PropTypes.string,
}

const mapStateToProps = ({ appStatus }) => ({
    appStatus,
})

export default connect(
    mapStateToProps,
    {
        initApp,
    }
)(UsageAnalytics)
