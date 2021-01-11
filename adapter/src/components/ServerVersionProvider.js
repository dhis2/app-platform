import { Provider } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { get } from '../utils/api'
import { parseServerVersion } from '../utils/parseServerVersion'
import { LoadingMask } from './LoadingMask'

export const ServerVersionProvider = ({ url, apiVersion, children }) => {
    const [{ loading, error, systemInfo }, setState] = useState({
        loading: true,
    })

    useEffect(() => {
        setState(state => (state.loading ? state : { loading: true }))
        const request = get(`${url}/api/system/info`)
        request
            .then(systemInfo => {
                setState({ loading: false, systemInfo })
            })
            .catch(e => {
                setState({ loading: false, error: e })
            })

        return () => {
            request.abort()
        }
    }, [url])

    if (loading) {
        return <LoadingMask />
    }

    if (error) {
        return children
    }

    const serverVersion = parseServerVersion(systemInfo.version)
    const realApiVersion = serverVersion.minor

    return (
        <Provider
            config={{
                baseUrl: url,
                apiVersion: apiVersion || realApiVersion,
                serverVersion,
                systemInfo,
            }}
        >
            {children}
        </Provider>
    )
}

ServerVersionProvider.propTypes = {
    url: PropTypes.string.isRequired,
    apiVersion: PropTypes.number,
    children: PropTypes.element,
}
