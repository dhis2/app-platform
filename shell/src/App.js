import React from 'react'
import AppAdapter from '@dhis2/app-adapter'
import { ScreenCover, CircularLoader } from '@dhis2/ui-core'

const D2App = React.lazy(() =>
    import(/*webpackChunkName: 'app'*/ './current-d2-app/app')
) // Automatic bundle splitting!

const appConfig = {
    url:
        process.env.REACT_APP_DHIS2_BASE_URL ||
        window.localStorage.DHIS2_BASE_URL,
    appName: process.env.REACT_APP_DHIS2_APP_NAME || '',
    apiVersion: parseInt(process.env.REACT_APP_DHIS2_API_VERSION) || 32,
}

const App = () => (
    <AppAdapter {...appConfig}>
        <React.Suspense
            fallback={
                <ScreenCover>
                    <CircularLoader />
                </ScreenCover>
            }
        >
            <D2App config={appConfig} />
        </React.Suspense>
    </AppAdapter>
)

export default App
