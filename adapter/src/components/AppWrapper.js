import PropTypes from 'prop-types'
import React from 'react'
import { useCurrentUserLocale } from '../utils/useLocale.js'
import { useVerifyLatestUser } from '../utils/useVerifyLatestUser.js'
import { Alerts } from './Alerts.js'
import { ConnectedHeaderBar } from './ConnectedHeaderBar.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { LoadingMask } from './LoadingMask.js'
import { styles } from './styles/AppWrapper.style.js'

const AppWrapper = ({
    children,
    plugin,
    autoResizePlugin,
    onPluginError,
    clearPluginError,
}) => {
    const { loading: localeLoading } = useCurrentUserLocale()
    const { loading: latestUserLoading } = useVerifyLatestUser()

    if (localeLoading || latestUserLoading) {
        return <LoadingMask />
    }

    if (plugin) {
        return (
            <div className="app-shell-adapter">
                <style jsx>{styles}</style>
                <div
                    className={
                        autoResizePlugin ? 'app-shell-plugin' : 'app-shell-app'
                    }
                >
                    <ErrorBoundary
                        plugin={true}
                        onPluginError={onPluginError}
                        onRetry={() => {
                            clearPluginError()
                            window.location.reload()
                        }}
                    >
                        {children}
                    </ErrorBoundary>
                </div>
                <Alerts />
            </div>
        )
    }

    return (
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
    )
}

AppWrapper.propTypes = {
    autoResizePlugin: PropTypes.bool,
    children: PropTypes.node,
    clearPluginError: PropTypes.func,
    plugin: PropTypes.bool,
    onPluginError: PropTypes.func,
}

export { AppWrapper }
