import React from 'react'
import AppAdapter from '@dhis2/app-adapter'

const D2App = React.lazy(() => import('./current-d2-app/app')) // Automatic bundle splitting!

const appConfig = {
    url: process.env.REACT_APP_DHIS2_BASE_URL || 'http://localhost:8080',
    appName: process.env.REACT_APP_DHIS2_APP_NAME || '',
}

const App = () => (
    <AppAdapter {...appConfig}>
        <React.Suspense fallback={<div />}>
            <D2App config={appConfig} />
        </React.Suspense>
    </AppAdapter>
)

export default App
