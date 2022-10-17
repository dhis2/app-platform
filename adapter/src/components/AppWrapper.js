import PropTypes from 'prop-types'
import React from 'react'
import { useCurrentUserLocale } from '../utils/useLocale.js'
import { Alerts } from './Alerts.js'
import { AuthBoundary } from './AuthBoundary.js'
import { ConnectedHeaderBar } from './ConnectedHeaderBar.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { LoadingMask } from './LoadingMask.js'
import { styles } from './styles/AppWrapper.style.js'

export const AppWrapper = ({ children }) => {
    const { loading: localeLoading } = useCurrentUserLocale()

    if (localeLoading) {
        return <LoadingMask />
    }

    return (
        <AuthBoundary>
            <div className="app-shell-adapter">
                <style jsx>{styles}</style>
                <ConnectedHeaderBar />
                <div className="app-shell-app">
                    <ErrorBoundary onRetry={() => window.location.reload()}>
                        {children}
                    </ErrorBoundary>
                </div>
                <Alerts />
            </div>
        </AuthBoundary>
    )
}

AppWrapper.propTypes = {
    children: PropTypes.node,
}
