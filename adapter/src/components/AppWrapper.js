import { HeaderBar } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useCurrentUserLocale } from '../utils/useLocale.js'
import { Alerts } from './Alerts.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { LoadingMask } from './LoadingMask.js'
import { styles } from './styles/AppWrapper.style.js'

export const AppWrapper = ({ appName, appVersion, children }) => {
    const { loading } = useCurrentUserLocale()

    if (loading) {
        return <LoadingMask />
    }

    return (
        <div className="app-shell-adapter">
            <HeaderBar appName={appName} appVersion={appVersion} />

            <div className="app-shell-app">
                <ErrorBoundary onRetry={() => window.location.reload()}>
                    {children}
                </ErrorBoundary>
            </div>

            <Alerts />

            <style jsx>{styles}</style>
        </div>
    )
}

AppWrapper.propTypes = {
    appName: PropTypes.string.isRequired,
    appVersion: PropTypes.string,
    children: PropTypes.node,
}
