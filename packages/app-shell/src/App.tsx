import React from 'react'
import HeaderBar from '@dhis2/ui/widgets/HeaderBar'

// @ts-ignore
const D2App = React.lazy(() => import('./current-d2-app/App')) // Automatic bundle splitting!

const url = process.env.REACT_APP_DHIS2_BASE_URL

const App = () => (
    <div>
        <HeaderBar appName={process.env.REACT_APP_DHIS2_APP_NAME} />
        <React.Suspense fallback={<div />}>
            <D2App
                config={{
                    url,
                }}
            />
        </React.Suspense>
    </div>
)

export default App
