import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import buttonStyles from './styles/Button.style'
import styles from './styles/ErrorBoundary.style'

const translatedErrorHeading = i18n.t(
    'An error occurred in the DHIS2 application.'
)

const replaceNewlinesWithBreaks = text =>
    text
        .split('\n')
        .reduce((out, line, i) => [...out, line, <br key={i} />], [])

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = {
            error: null,
            errorInfo: null,
            drawerOpen: false,
        }
    }

    componentDidCatch(error, errorInfo) {
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

    render() {
        const { children } = this.props
        if (this.state.error) {
            return (
                <div
                    className={cx('mask', {
                        fullscreen: this.props.fullscreen,
                    })}
                >
                    <style jsx>{styles}</style>
                    <style jsx>{buttonStyles}</style>
                    <div className="container">
                        {/* <InfoIcon className="icon" /> */}
                        <div className="message">
                            {i18n.t('Something went wrong')}
                        </div>
                        <div className="retry">
                            <button
                                onClick={() => {
                                    this.props.onRetry && this.props.onRetry()
                                }}
                            >
                                {i18n.t('Try again')}
                            </button>
                        </div>
                        <div
                            className="drawerToggle"
                            onClick={this.toggleTechInfoDrawer}
                        >
                            {this.state.drawerOpen
                                ? i18n.t('Hide technical details')
                                : i18n.t('Show technical details')}
                        </div>
                        <div
                            className={
                                this.state.drawerOpen
                                    ? 'drawerVisible'
                                    : 'drawerHidden'
                            }
                        >
                            <div className="errorIntro">
                                {translatedErrorHeading}
                                <br />
                                {i18n.t(
                                    'The following information may be requested by technical support.'
                                )}
                            </div>
                            <div className="errorDetails">
                                {[
                                    replaceNewlinesWithBreaks(
                                        this.state.error.stack +
                                            '\n---' +
                                            this.state.errorInfo.componentStack
                                    ),
                                ]}
                            </div>
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
