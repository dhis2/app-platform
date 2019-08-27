import React from 'react'
import { HeaderBar } from '@dhis2/ui-widgets'
import { DataProvider } from '@dhis2/app-runtime'
import { FatalErrorBoundary } from './FatalErrorBoundary'
import { AuthBoundary } from './AuthBoundary'

const App = ({ url, appName, children }) => (
    <FatalErrorBoundary>
        <DataProvider baseUrl={url} apiVersion={32}>
            <HeaderBar appName={appName} />
            <AuthBoundary url={url}>{children}</AuthBoundary>
        </DataProvider>
    </FatalErrorBoundary>
)

export default App
