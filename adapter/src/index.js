import React from 'react'
import { HeaderBar } from '@dhis2/ui'
import { Provider } from '@dhis2/app-runtime'
import { FatalErrorBoundary } from './FatalErrorBoundary'
import { AuthBoundary } from './AuthBoundary'

import { styles } from './styles.js'

// eslint-disable-next-line react/prop-types
const App = ({ url, apiVersion, appName, children }) => (
    <FatalErrorBoundary>
        <Provider config={{ baseUrl: url, apiVersion: apiVersion }}>
            <div className="app-shell-adapter">
                <style jsx>{styles}</style>
                <HeaderBar appName={appName} />
                <AuthBoundary url={url}>
                    <div className="app-shell-app">{children}</div>
                </AuthBoundary>
            </div>
        </Provider>
    </FatalErrorBoundary>
)

export default App
