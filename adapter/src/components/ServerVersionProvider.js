import { Provider } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { get } from '../utils/api.js'
import { parseServerVersion } from '../utils/parseServerVersion.js'
import { LoadingMask } from './LoadingMask.js'
import { LoginModal } from './LoginModal.js'

export const ServerVersionProvider = ({
    url,
    apiVersion,
    offlineInterface,
    pwaEnabled,
    children,
}) => {
    const [{ loading, error, systemInfo }, setState] = useState({
        loading: true,
    })

    useEffect(() => {
        if (!url) {
            setState({ loading: false, error: new Error('No url specified') })
            return
        }

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
        return <LoginModal />
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
                pwaEnabled,
            }}
            offlineInterface={offlineInterface}
        >
            {children}
        </Provider>
    )
}

ServerVersionProvider.propTypes = {
    apiVersion: PropTypes.number,
    children: PropTypes.element,
    offlineInterface: PropTypes.shape({}),
    pwaEnabled: PropTypes.bool,
    url: PropTypes.string,
}
