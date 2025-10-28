import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import buttonStyles from './styles/Button.style.js'
import styles from './styles/ErrorBoundary.style.js'

// In order to avoid using @dhis2/ui components in the error boundary - as anything
// that breaks within it will not be caught properly - we define a component
// with the same styles as Button
const UIButton = ({ children, onClick, plugin }) => (
    <>
        <style jsx>{buttonStyles}</style>
        <button className={plugin ? 'pluginButton' : null} onClick={onClick}>
            {children}
        </button>
    </>
)

UIButton.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired,
    plugin: PropTypes.bool,
}

const InfoIcon24 = () => (
    <svg
        height="24"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="m12 2c5.5228475 0 10 4.4771525 10 10s-4.4771525 10-10 10-10-4.4771525-10-10 4.4771525-10 10-10zm0 2c-4.418278 0-8 3.581722-8 8s3.581722 8 8 8 8-3.581722 8-8-3.581722-8-8-8zm1 7v6h-2v-6zm-1-4c.5522847 0 1 .44771525 1 1s-.4477153 1-1 1-1-.44771525-1-1 .4477153-1 1-1z"
            fill="#A0ADBA"
        ></path>
    </svg>
)

const translatedErrorHeading = i18n.t(
    'An error occurred in the DHIS2 application.'
)

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = {
            error: null,
            errorInfo: null,
            drawerOpen: false,
        }
        this.errorDetailsRef = React.createRef()
    }

    componentDidCatch(error, errorInfo) {
        if (this.props.plugin) {
            if (this.props.onPluginError) {
                console.error(error)
                this.props.onPluginError(error)
            }
        }
        this.setState({
            error,
            errorInfo,
        })
    }

    toggleTechInfoDrawer = () => {
        this.setState({
            drawerOpen: !this.state.drawerOpen,
        })
    }

    handleCopyErrorDetails = () => {
        const errorDetails = this.errorDetailsRef.current.textContent
        navigator.clipboard.writeText(errorDetails).then(() => {
            alert(i18n.t('Technical details copied to clipboard'))
        })
    }

    handleCopyErrorDetailsPlugin = ({
        error,
        errorInfo,
        appVersion,
        apiVersion,
    }) => {
        const errorDetails = `DHIS2 version: ${apiVersion}\n App version: ${appVersion}\n${error}\n${error?.stack}\n${errorInfo?.componentStack}`
        navigator.clipboard.writeText(errorDetails).then(() => {
            alert(i18n.t('Technical details copied to clipboard'))
        })
    }

    handleSafeLoginRedirect = () => {
        window.location.href =
            this.props.baseURL +
            (this.props.baseURL.endsWith('/') ? '' : '/') +
            'dhis-web-commons/security/login.action'
    }

    render() {
        const {
            children,
            fullscreen,
            onRetry,
            loginApp,
            baseURL,
            appVersion,
            apiVersion,
        } = this.props

        if (this.state.error) {
            if (this.props.plugin) {
                return (
                    <>
                        <style jsx>{styles}</style>
                        <div className="pluginBoundary">
                            <InfoIcon24 />
                            <div className="pluginErrorMessage">
                                {i18n.t(
                                    'There was a problem loading this plugin'
                                )}
                            </div>
                            <div
                                className="pluginErrorCopy"
                                onClick={() => {
                                    this.handleCopyErrorDetailsPlugin({
                                        error: this.state.error,
                                        errorInfo: this.state.errorInfo,
                                        apiVersion: apiVersion,
                                        appVersion: appVersion,
                                    })
                                }}
                            >
                                <p>
                                    {apiVersion &&
                                        `DHIS2 Version: ${apiVersion}\n`}
                                    {appVersion &&
                                        `App Version: ${appVersion}\n`}
                                </p>
                                {i18n.t('Copy debug info to clipboard')}
                            </div>
                            {onRetry && (
                                <div className="pluginRetry">
                                    <UIButton onClick={onRetry} plugin>
                                        {i18n.t('Try again')}
                                    </UIButton>
                                </div>
                            )}
                        </div>
                    </>
                )
            }
            return (
                <div className={cx('mask', { fullscreen })}>
                    <style jsx>{styles}</style>
                    <div className="container">
                        <h1 className="message">
                            {i18n.t('Something went wrong')}
                        </h1>
                        {loginApp && baseURL && (
                            <div className="retry">
                                <UIButton
                                    onClick={this.handleSafeLoginRedirect}
                                >
                                    {i18n.t('Redirect to safe login mode')}
                                </UIButton>
                            </div>
                        )}
                        {onRetry && (
                            <div className="retry">
                                <UIButton onClick={onRetry}>
                                    {i18n.t('Try again')}
                                </UIButton>
                            </div>
                        )}
                        <button
                            className="drawerToggle"
                            onClick={this.toggleTechInfoDrawer}
                        >
                            {this.state.drawerOpen
                                ? i18n.t('Hide technical details')
                                : i18n.t('Show technical details')}
                        </button>
                        <div
                            className={cx('drawer', {
                                hidden: !this.state.drawerOpen,
                            })}
                        >
                            <div className="errorIntro">
                                <p>{translatedErrorHeading}</p>
                                <p>
                                    {i18n.t(
                                        'The following information may be requested by technical support.'
                                    )}
                                </p>
                                <UIButton onClick={this.handleCopyErrorDetails}>
                                    {i18n.t(
                                        'Copy technical details to clipboard'
                                    )}
                                </UIButton>
                            </div>
                            <pre
                                className="errorDetails"
                                ref={this.errorDetailsRef}
                            >
                                {apiVersion &&
                                    `DHIS2 Version: ${this.props.apiVersion}\n`}
                                {appVersion &&
                                    `App Version: ${this.props.appVersion}\n`}
                                {`\n`}
                                {`${this.state.error}\n`}
                                {this.state.error.stack}
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </div>
                    </div>
                </div>
            )
        }

        return children
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
    apiVersion: PropTypes.number,
    appVersion: PropTypes.string,
    baseURL: PropTypes.string,
    fullscreen: PropTypes.bool,
    loginApp: PropTypes.bool,
    plugin: PropTypes.bool,
    onPluginError: PropTypes.func,
    onRetry: PropTypes.func,
}
