import PropTypes from 'prop-types'
import React, { Component } from 'react'

const grey100 = '#F8F9FA',
    grey600 = '#6C7787'

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
                <>
                    <div className="pluginBoundary">
                        <InfoIcon24 />
                        <div className="pluginErrorMessage">
                            There was a problem loading this plugin
                        </div>
                    </div>
                    <style jsx>
                        {`
                            .pluginBoundary {
                                background-color: ${grey100};
                                height: 100vh;
                                width: 100vw;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                padding-block-start: 16px;
                            }

                            .pluginErrorMessage {
                                margin-block-start: 8px;
                                color: ${grey600};
                            }
                        `}
                    </style>
                </>
            )
        }

        return children
    }
}

PluginOuterErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
}
