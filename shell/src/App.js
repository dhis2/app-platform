import React from 'react'

const AppAdapter = React.lazy(() => import('@dhis2/app-adapter'))
const D2App = React.lazy(() => import('./current-d2-app/app')) // Automatic bundle splitting!

const appConfig = {
    url: process.env.REACT_APP_DHIS2_BASE_URL || 'http://localhost:8080',
    appName: process.env.REACT_APP_DHIS2_APP_NAME || '',
}

const App = () => (
    <React.Suspense fallback={<div />}>
        <AppAdapter {...appConfig}>
            <D2App config={appConfig} />
        </AppAdapter>
    </React.Suspense>
)

export default App
