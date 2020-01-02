import React from 'react'
import { HeaderBar } from '@dhis2/ui-widgets'
import { Provider } from '@dhis2/app-runtime'
import { FatalErrorBoundary } from './FatalErrorBoundary'
import { AuthBoundary } from './AuthBoundary'

// eslint-disable-next-line react/prop-types
const App = ({ url, apiVersion, appName, children }) => (
    <FatalErrorBoundary>
        <Provider config={{ baseUrl: url, apiVersion: apiVersion }}>
            <HeaderBar appName={appName} />
            <AuthBoundary url={url}>{children}</AuthBoundary>
        </Provider>
    </FatalErrorBoundary>
)

export default App
