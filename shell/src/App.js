import AppAdapter from '@dhis2/app-adapter'
import { Layer, layers, CenteredContent, CircularLoader } from '@dhis2/ui'
import React from 'react'

const D2App = React.lazy(() =>
    import(/*webpackChunkName: 'app'*/ './D2App/app')
) // Automatic bundle splitting!

const appConfig = {
    url: process.env.REACT_APP_DHIS2_BASE_URL,
    appName: process.env.REACT_APP_DHIS2_APP_NAME || '',
    appVersion: process.env.REACT_APP_DHIS2_APP_VERSION || '',
    apiVersion: parseInt(process.env.REACT_APP_DHIS2_API_VERSION),
    pwaEnabled: process.env.REACT_APP_DHIS2_APP_PWA_ENABLED === 'true',
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
