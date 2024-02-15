import PropTypes from 'prop-types'
import React, { Component } from 'react'

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
            return <p>Plugin outermost error boundary</p>
        }

        return children
    }
}

PluginOuterErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
}
