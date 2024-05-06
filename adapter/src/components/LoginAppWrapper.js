import { useConfig } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React from 'react'
import { useSystemDefaultLocale } from '../utils/useLocale.js'
import { Alerts } from './Alerts.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { LoadingMask } from './LoadingMask.js'
import { styles } from './styles/AppWrapper.style.js'

export const LoginAppWrapper = ({ children }) => {
    const { loading: localeLoading } = useSystemDefaultLocale()
    const { baseUrl } = useConfig()
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
                    loginApp={true}
                    baseURL={baseUrl}
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
}
