import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import buttonStyles from './styles/Button.style.js'
import styles from './styles/ErrorBoundary.style.js'

// In order to avoid using @dhis2/ui components in the error boundary - as anything
// that breaks within it will not be caught properly - we define a component
// with the same styles as Button
const UIButton = ({ children, onClick }) => (
    <>
        <style jsx>{buttonStyles}</style>
        <button onClick={onClick}>{children}</button>
    </>
)

UIButton.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired,
}

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
                console.log('special handling for error (from app)')
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

    render() {
        const { children, fullscreen, onRetry } = this.props
        if (this.state.error) {
            if (this.props.plugin) {
                return (
                    <>
                        <style jsx>{styles}</style>
                        <div className="pluginBoundary">
                            <span>I am the default plugin boundary</span>
                            {onRetry && (
                                <div className="retry">
                                    <UIButton onClick={onRetry}>
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
    fullscreen: PropTypes.bool,
    onRetry: PropTypes.func,
}
