import { checkForSWUpdateAndReload } from '@dhis2/pwa'
import PropTypes from 'prop-types'
import React from 'react'
import { LoginAppWrapper, AppWrapper } from './components/AppWrapper.js'
import { ErrorBoundary } from './components/ErrorBoundary.js'
import { OfflineInterfaceProvider } from './components/OfflineInterfaceContext.js'
import { PWALoadingBoundary } from './components/PWALoadingBoundary.js'
import { ServerVersionProvider } from './components/ServerVersionProvider.js'

const AppAdapter = ({
    appName,
    appVersion,
    url,
    apiVersion,
    pwaEnabled,
    plugin,
    loginApp,
    children,
}) => {
    if (loginApp) {
        return (
            <ErrorBoundary
                fullscreen
                onRetry={() => {
                    window.location.reload()
                }}
            >
                <ServerVersionProvider
                    appName={appName}
                    appVersion={appVersion}
                    url={url}
                    apiVersion={apiVersion}
                    pwaEnabled={pwaEnabled}
                    loginApp={true}
                >
                    <LoginAppWrapper>{children}</LoginAppWrapper>
                </ServerVersionProvider>
            </ErrorBoundary>
        )
    }
    return (
        <ErrorBoundary fullscreen onRetry={checkForSWUpdateAndReload}>
            <OfflineInterfaceProvider>
                <PWALoadingBoundary>
                    <ServerVersionProvider
                        appName={appName}
                        appVersion={appVersion}
                        url={url}
                        apiVersion={apiVersion}
                        pwaEnabled={pwaEnabled}
                        loginApp={false}
                    >
                        <AppWrapper plugin={plugin} loginApp={loginApp}>
                            {children}
                        </AppWrapper>
                    </ServerVersionProvider>
                </PWALoadingBoundary>
            </OfflineInterfaceProvider>
        </ErrorBoundary>
    )
}

AppAdapter.propTypes = {
    appName: PropTypes.string.isRequired,
    appVersion: PropTypes.string.isRequired,
    apiVersion: PropTypes.number,
    children: PropTypes.element,
    loginApp: PropTypes.bool,
    plugin: PropTypes.bool,
    pwaEnabled: PropTypes.bool,
    url: PropTypes.string,
}

export default AppAdapter
