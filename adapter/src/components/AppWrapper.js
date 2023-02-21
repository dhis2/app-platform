import PropTypes from 'prop-types'
import React from 'react'
import {
    useCurrentUserLocale,
    useSystemDefaultLocale,
} from '../utils/useLocale.js'
import { useVerifyLatestUser } from '../utils/useVerifyLatestUser.js'
import { Alerts } from './Alerts.js'
import { ConnectedHeaderBar } from './ConnectedHeaderBar.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { LoadingMask } from './LoadingMask.js'
import { styles } from './styles/AppWrapper.style.js'

export const AppWrapper = ({ children, plugin }) => {
    const { loading: localeLoading } = useCurrentUserLocale()
    const { loading: latestUserLoading } = useVerifyLatestUser()

    if (localeLoading || latestUserLoading) {
        return <LoadingMask />
    }

    return (
        <div className="app-shell-adapter">
            <style jsx>{styles}</style>
            {!plugin && <ConnectedHeaderBar />}
            <div className="app-shell-app">
                <ErrorBoundary onRetry={() => window.location.reload()}>
                    {children}
                </ErrorBoundary>
            </div>
            <Alerts />
        </div>
    )
}

AppWrapper.propTypes = {
    children: PropTypes.node,
    plugin: PropTypes.bool,
}

export const LoginAppWrapper = ({ children }) => {
    const { loading: localeLoading } = useSystemDefaultLocale()
    // cannot check current user for a loginApp (no api/me)

    if (localeLoading) {
        return <LoadingMask />
    }

    return (
        <div className="app-shell-adapter">
            <style jsx>{styles}</style>
            <div className="app-shell-app">
                <ErrorBoundary onRetry={() => window.location.reload()}>
                    {children}
                </ErrorBoundary>
            </div>
            <Alerts />
        </div>
    )
}

LoginAppWrapper.propTypes = {
    children: PropTypes.node,
}
