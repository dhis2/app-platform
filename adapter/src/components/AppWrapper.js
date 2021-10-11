import { HeaderBar } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useCurrentUserLocale } from '../utils/useLocale.js'
import { useVerifyLatestUser } from '../utils/useVerifyLatestUser.js'
import { Alerts } from './Alerts.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { LoadingMask } from './LoadingMask.js'
import PWAUpdateManager from './PWAUpdateManager.js'
import { styles } from './styles/AppWrapper.style.js'

export const AppWrapper = ({ appName, children, offlineInterface }) => {
    const { loading: localeLoading } = useCurrentUserLocale()
    const { loading: latestUserLoading } = useVerifyLatestUser()

    if (localeLoading || latestUserLoading) {
        return <LoadingMask />
    }

    return (
        <div className="app-shell-adapter">
            <style jsx>{styles}</style>
            <HeaderBar appName={appName} />
            <div className="app-shell-app">
                <ErrorBoundary onRetry={() => window.location.reload()}>
                    {children}
                </ErrorBoundary>
            </div>
            <Alerts />
            <PWAUpdateManager offlineInterface={offlineInterface} />
        </div>
    )
}

AppWrapper.propTypes = {
    appName: PropTypes.string.isRequired,
    offlineInterface: PropTypes.object.isRequired,
    children: PropTypes.node,
}
