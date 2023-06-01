import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import styles from './styles/ErrorBoundary.style.js'

// In order to avoid using @dhis2/ui components in the error boundary - as anything
// that breaks within it will not be caught properly - we define a component
// with the same styles as Button

const Info30Grey500 = () => (
    <svg
        height="30"
        viewBox="0 0 24 24"
        width="30"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="m12 2c5.5228475 0 10 4.4771525 10 10s-4.4771525 10-10 10-10-4.4771525-10-10 4.4771525-10 10-10zm0 2c-4.418278 0-8 3.581722-8 8s3.581722 8 8 8 8-3.581722 8-8-3.581722-8-8-8zm1 7v6h-2v-6zm-1-4c.5522847 0 1 .44771525 1 1s-.4477153 1-1 1-1-.44771525-1-1 .4477153-1 1-1z"
            fill="#A0ADBA"
        />
    </svg>
)

export const PluginErrorComponent = ({ error, errorInfo, onRetry }) => {
    const copyErrorInfoToClipboard = () => {
        const errorDetails = `${error}\n${error.stack}\n${errorInfo.componentStack}`
        navigator.clipboard.writeText(errorDetails).then(() => {
            alert(i18n.t('Technical details copied to clipboard'))
        })
    }

    const pluginName = window.parent?.[0]?.name

    return (
        <>
            <style jsx>{styles}</style>
            <div className="pluginBoundaryWrapper">
                {pluginName && (
                    <span className="pluginBoundaryWrapperName">
                        {pluginName}
                    </span>
                )}
                <div className="pluginBoundary">
                    <div className="pluginErrorItems">
                        <Info30Grey500 />
                        <span className="pluginErrorText">
                            {i18n.t('There was a problem loading this plugin')}
                        </span>
                        <span
                            className="pluginErrorCopyToClipboard"
                            onClick={copyErrorInfoToClipboard}
                        >
                            {i18n.t('Copy debug info to clipboard')}
                        </span>
                        {onRetry && (
                            <div className="retry">
                                <button onClick={onRetry}>
                                    {i18n.t('Try again')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

PluginErrorComponent.propTypes = {
    error: PropTypes.object,
    errorInfo: PropTypes.object,
    onRetry: PropTypes.func,
}
