import { OfflineProvider } from '@dhis2/app-service-offline'
import { OfflineInterface } from '@dhis2/sw'
import { HeaderBar } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { Alerts } from './components/Alerts'
import { AuthBoundary } from './components/AuthBoundary'
import { FatalErrorBoundary } from './components/FatalErrorBoundary'
import { ServerVersionProvider } from './components/ServerVersionProvider'
import { styles } from './styles.js'

const offlineInterface = new OfflineInterface()

const App = ({ url, apiVersion, appName, children }) => (
    <FatalErrorBoundary>
        <ServerVersionProvider url={url} apiVersion={apiVersion}>
            <OfflineProvider offlineInterface={offlineInterface}>
                <div className="app-shell-adapter">
                    <style jsx>{styles}</style>
                    <HeaderBar appName={appName} />
                    <AuthBoundary url={url}>
                        <div className="app-shell-app">{children}</div>
                    </AuthBoundary>
                    <Alerts />
                </div>
            </OfflineProvider>
        </ServerVersionProvider>
    </FatalErrorBoundary>
)

App.propTypes = {
    appName: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    apiVersion: PropTypes.number,
    children: PropTypes.element,
}

export default App
