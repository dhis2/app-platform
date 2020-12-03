import React from 'react'
import AppAdapter from '@dhis2/app-adapter'
import { Layer, layers, CenteredContent, CircularLoader } from '@dhis2/ui'

const D2App = React.lazy(() =>
    import(/*webpackChunkName: 'app'*/ 'D2App')
) // Automatic bundle splitting!

const appConfig = {
    url:
        process.env.REACT_APP_DHIS2_BASE_URL ||
        window.localStorage.DHIS2_BASE_URL,
    appName: process.env.REACT_APP_DHIS2_APP_NAME || '',
    apiVersion: parseInt(process.env.REACT_APP_DHIS2_API_VERSION),
}

const App = () => (
    <AppAdapter {...appConfig}>
        <React.Suspense
            fallback={
                <Layer translucent level={layers.alert}>
                    <CenteredContent>
                        <CircularLoader />
                    </CenteredContent>
                </Layer>
            }
        >
            <D2App config={appConfig} />
        </React.Suspense>
    </AppAdapter>
)

export default App
