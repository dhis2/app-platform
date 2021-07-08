import PropTypes from 'prop-types'
import React from 'react'
import { AppWrapper } from './components/AppWrapper.js'
import { FatalErrorBoundary } from './components/FatalErrorBoundary.js'
import { ServerVersionProvider } from './components/ServerVersionProvider.js'

const App = ({ url, apiVersion, appName, children }) => (
    <FatalErrorBoundary>
        <ServerVersionProvider url={url} apiVersion={apiVersion}>
            <AppWrapper url={url} appName={appName}>
                {children}
            </AppWrapper>
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
