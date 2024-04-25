import { checkForSWUpdateAndReload } from '@dhis2/pwa'
import PropTypes from 'prop-types'
import React from 'react'
import { AppWrapper } from './components/AppWrapper.js'
import { ErrorBoundary } from './components/ErrorBoundary.js'
import { LoginAppWrapper } from './components/LoginAppWrapper.js'
import { LoginAppWrapper } from './components/LoginAppWrapper.js'
import { OfflineInterfaceProvider } from './components/OfflineInterfaceContext.js'
import { PWALoadingBoundary } from './components/PWALoadingBoundary.js'
import { ServerVersionProvider } from './components/ServerVersionProvider.js'

const AppAdapter = ({
    appName,
    appVersion,
    url,
    apiVersion,
    direction,
    pwaEnabled,
    plugin,
    parentAlertsAdd,
    showAlertsInPlugin,
    onPluginError,
    clearPluginError,
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
                plugin={false}
                loginApp={true}
                baseURL={url}
            >
                <ServerVersionProvider
                    appName={appName}
                    appVersion={appVersion}
                    url={url}
                    apiVersion={apiVersion}
                    pwaEnabled={pwaEnabled}
                    loginApp={loginApp}
                    plugin={false}
                >
                    <LoginAppWrapper url={url}>{children}</LoginAppWrapper>
                </ServerVersionProvider>
            </ErrorBoundary>
        )
    }
    return (
        <ErrorBoundary
            plugin={plugin}
            fullscreen
            onRetry={checkForSWUpdateAndReload}
        >
            <OfflineInterfaceProvider>
                <PWALoadingBoundary>
                    <ServerVersionProvider
                        appName={appName}
                        appVersion={appVersion}
                        url={url}
                        apiVersion={apiVersion}
                        pwaEnabled={pwaEnabled}
                        plugin={plugin}
                        parentAlertsAdd={parentAlertsAdd}
                        showAlertsInPlugin={showAlertsInPlugin}
                    >
                        <AppWrapper
                            plugin={plugin}
                            onPluginError={onPluginError}
                            clearPluginError={clearPluginError}
                            direction={direction}
                        >
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
    clearPluginError: PropTypes.func,
    direction: PropTypes.oneOf(['ltr', 'rtl', 'auto']),
    loginApp: PropTypes.bool,
    parentAlertsAdd: PropTypes.func,
    plugin: PropTypes.bool,
    pwaEnabled: PropTypes.bool,
    showAlertsInPlugin: PropTypes.func,
    url: PropTypes.string,
    onPluginError: PropTypes.func,
}

export default AppAdapter
