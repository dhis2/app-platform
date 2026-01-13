import { useConfig } from '@dhis2/app-runtime'
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
    onPluginError,
    clearPluginError,
    direction: configDirection,
}) => {
    const { loading: localeLoading, direction: localeDirection } =
        useCurrentUserLocale(configDirection)
    const { loading: latestUserLoading } = useVerifyLatestUser()
    const { appName, appVersion, serverVersion } = useConfig()

    if (localeLoading || latestUserLoading) {
        return <LoadingMask />
    }

    if (plugin) {
        return (
            <div className="app-shell-adapter">
                <style jsx>{styles}</style>
                <div className="app-shell-app">
                    <ErrorBoundary
                        plugin={true}
                        onPluginError={onPluginError}
                        onRetry={() => {
                            if (clearPluginError) {
                                clearPluginError()
                            }
                            window.location.reload()
                        }}
                        appName={appName}
                        appVersion={appVersion?.full}
                        serverVersion={serverVersion?.full}
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
            <div dir={localeDirection}>
                <ConnectedHeaderBar />
            </div>
            <div className="app-shell-app">
                <ErrorBoundary
                    onRetry={() => window.location.reload()}
                    appName={appName}
                    appVersion={appVersion?.full}
                    serverVersion={serverVersion?.full}
                >
                    {children}
                </ErrorBoundary>
            </div>
            <Alerts />
        </div>
    )
}

AppWrapper.propTypes = {
    children: PropTypes.node,
    clearPluginError: PropTypes.func,
    direction: PropTypes.oneOf(['ltr', 'rtl', 'auto']),
    plugin: PropTypes.bool,
    onPluginError: PropTypes.func,
}

export { AppWrapper }
