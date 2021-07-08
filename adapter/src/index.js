import PropTypes from 'prop-types'
import React from 'react'
import { AppWrapper } from './components/AppWrapper.js'
import { FatalErrorBoundary } from './components/FatalErrorBoundary.js'
import { ServerVersionProvider } from './components/ServerVersionProvider.js'

const AppAdapter = ({ url, apiVersion, appName, children }) => (
    <FatalErrorBoundary>
        <ServerVersionProvider url={url} apiVersion={apiVersion}>
            <AppWrapper appName={appName}>{children}</AppWrapper>
        </ServerVersionProvider>
    </FatalErrorBoundary>
)

AppAdapter.propTypes = {
    appName: PropTypes.string.isRequired,
    url: PropTypes.string,
    apiVersion: PropTypes.number,
    children: PropTypes.element,
}

export default AppAdapter
