import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { PluginErrorComponent } from '@dhis2/app-adapter'

export class PluginOuterErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = {
            error: null,
            errorInfo: null,
        }
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo,
        })
    }

    render() {
        const { children } = this.props
        if (this.state.error) {
            return (
                // height/width set because app-shell styling will not load in this case
                <div style={{ height: '100vh', width: '100vw' }}>
                    <PluginErrorComponent
                        error={this.state.error}
                        errorInfo={this.state.errorInfo}
                    />
                </div>
            )
        }

        return children
    }
}

PluginOuterErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
}
