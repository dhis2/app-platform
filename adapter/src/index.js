import { checkForSWUpdateAndReload } from '@dhis2/pwa'
import PropTypes from 'prop-types'
import React from 'react'
import { AppWrapper } from './components/AppWrapper.js'
import { ErrorBoundary } from './components/ErrorBoundary.js'
import { OfflineInterfaceProvider } from './components/OfflineInterfaceContext.js'
import { PWALoadingBoundary } from './components/PWALoadingBoundary.js'
import { ServerVersionProvider } from './components/ServerVersionProvider.js'

const AppAdapter = ({
    appName,
    appVersion,
    autoResizePlugin,
    url,
    apiVersion,
    pwaEnabled,
    plugin,
    parentAlertsAdd,
    showAlertsInPlugin,
    onPluginError,
    clearPluginError,
    children,
}) => (
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
                        autoResizePlugin={autoResizePlugin}
                        onPluginError={onPluginError}
                        clearPluginError={clearPluginError}
                    >
                        {children}
                    </AppWrapper>
                </ServerVersionProvider>
            </PWALoadingBoundary>
        </OfflineInterfaceProvider>
    </ErrorBoundary>
)

AppAdapter.propTypes = {
    appName: PropTypes.string.isRequired,
    appVersion: PropTypes.string.isRequired,
    apiVersion: PropTypes.number,
    autoResizePlugin: PropTypes.bool,
    children: PropTypes.element,
    clearPluginError: PropTypes.func,
    parentAlertsAdd: PropTypes.func,
    plugin: PropTypes.bool,
    pwaEnabled: PropTypes.bool,
    showAlertsInPlugin: PropTypes.func,
    url: PropTypes.string,
    onPluginError: PropTypes.func,
}

export default AppAdapter
