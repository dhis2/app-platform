import PropTypes from 'prop-types'
import React from 'react'
import { useSystemDefaultLocale } from '../utils/useLocale.js'
import { Alerts } from './Alerts.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { LoadingMask } from './LoadingMask.js'
import { styles } from './styles/AppWrapper.style.js'

export const LoginAppWrapper = ({ url, children }) => {
    const { loading: localeLoading } = useSystemDefaultLocale()
    // cannot check current user for a loginApp (no api/me)

    if (localeLoading) {
        return <LoadingMask />
    }

    return (
        <div className="app-shell-adapter">
            <style jsx>{styles}</style>
            <div className="app-shell-app">
                <ErrorBoundary
                    onRetry={() => window.location.reload()}
                    login={true}
                    baseURL={url}
                >
                    {children}
                </ErrorBoundary>
            </div>
            <Alerts />
        </div>
    )
}

LoginAppWrapper.propTypes = {
    children: PropTypes.node,
    url: PropTypes.string,
}
