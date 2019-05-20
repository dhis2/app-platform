import React from 'react'
import { HeaderBar } from '@dhis2/ui-widgets'
import { DataProvider } from '@dhis2/app-runtime'

const D2App = React.lazy(() => import('./current-d2-app/App')) // Automatic bundle splitting!

const url = process.env.REACT_APP_DHIS2_BASE_URL || 'http://localhost:8080'

const App = () => (
    <DataProvider baseUrl={url} apiVersion={32}>
        <HeaderBar appName={process.env.REACT_APP_DHIS2_APP_NAME || ''} />
        <React.Suspense fallback={<div />}>
            <D2App
                config={{
                    url,
                }}
            />
        </React.Suspense>
    </DataProvider>
)

export default App
