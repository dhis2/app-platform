import AppAdapter from '@dhis2/app-adapter'
import { CssReset } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import createAppConfig from './shell/create-app-config.js'
import LoadingDisplay from './shell/loading-display.js'
import verifyChildrenIsTheApp from './shell/verify-children-is-the-app.js'

export function Shell({ children }) {
    verifyChildrenIsTheApp(children)

    const appConfig = createAppConfig()
    const appWithConfig = React.Children.map(
        children,
        child => React.cloneElement(child, { config: appConfig })
    )

    return (
        <>
            <CssReset />
            <AppAdapter {...appConfig}>
                <React.Suspense fallback={<LoadingDisplay />}>
                    {appWithConfig}
                </React.Suspense>
            </AppAdapter>
        </>
    )
}

Shell.propTypes = {
    children: PropTypes.node,
}
