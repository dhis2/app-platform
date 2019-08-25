import React, { Component } from 'react'
import PropTypes from 'prop-types'
import i18n from '@dhis2/d2-i18n'
// import InfoIcon from '@material-ui/icons/InfoOutlined';
import styles from './styles/FatalErrorBoundary.style'

const translatedErrorHeading = i18n.t(
    'An error occurred in the DHIS2 application.'
)

const replaceNewlinesWithBreaks = text =>
    text
        .split('\n')
        .reduce((out, line, i) => [...out, line, <br key={i} />], [])

export class FatalErrorBoundary extends Component {
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
                <div className="mask">
                    <style jsx>{styles}</style>
                    <div className="container">
                        {/* <InfoIcon className="icon" /> */}
                        <div className="message">
                            {i18n.t('Something went wrong')}
                        </div>
                        <div
                            className="link"
                            onClick={() => window.location.reload()}
                        >
                            {i18n.t('Refresh to try again')}
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

FatalErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
}
