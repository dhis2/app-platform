import Adapter from '@dhis2/app-adapter'
import React from 'react'
import ReactDOM from 'react-dom'

const LazyApp = React.lazy(() => import('./App.js'))

const appConfig = {
    url:
        process.env.REACT_APP_DHIS2_BASE_URL ||
        window.localStorage.DHIS2_BASE_URL,
    appName: process.env.REACT_APP_DHIS2_APP_NAME || '',
}

ReactDOM.render(
    <Adapter {...appConfig}>
        <LazyApp />
    </Adapter>,
    document.getElementById('root')
)
