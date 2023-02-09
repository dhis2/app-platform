import PropTypes from 'prop-types'
import React, { createContext, useContext, useState } from 'react'
import { useCurrentUserLocale } from '../utils/useLocale.js'
import { useVerifyLatestUser } from '../utils/useVerifyLatestUser.js'
import { Alerts } from './Alerts.js'
import { ConnectedHeaderBar } from './ConnectedHeaderBar.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { LoadingMask } from './LoadingMask.js'
import { styles } from './styles/AppWrapper.style.js'
import { usePluginContext } from '@dhis2/app-runtime'

const PluginErrorBoundaryWrapper = ({ children }) => {
    const { onPluginError, clearPluginError } = usePluginContext()

    const retry = () => {
        clearPluginError()
        window.location.reload()
    }
    return (
        <ErrorBoundary
            plugin={true}
            onPluginError={onPluginError}
            onRetry={retry}
        >
            {children}
        </ErrorBoundary>
    )
}

const AppWrapper = ({ children, plugin }) => {
    const { loading: localeLoading } = useCurrentUserLocale()
    const { loading: latestUserLoading } = useVerifyLatestUser()

    if (localeLoading || latestUserLoading) {
        return <LoadingMask />
    }

    if (plugin) {
        return (
            <div className="app-shell-adapter">
                <style jsx>{styles}</style>
                <div className="app-shell-app">
                    <PluginErrorBoundaryWrapper>
                        {children}
                    </PluginErrorBoundaryWrapper>
                </div>
                <Alerts />
            </div>
        )
    }

    return (
        <div className="app-shell-adapter">
            <style jsx>{styles}</style>
            {!plugin && <ConnectedHeaderBar />}
            <div className="app-shell-app">
                <ErrorBoundary onRetry={() => window.location.reload()}>
                    {children}
                </ErrorBoundary>
            </div>
            <Alerts />
        </div>
    )
}

AppWrapper.propTypes = {
    children: PropTypes.node,
    plugin: PropTypes.bool,
}

export { AppWrapper }
