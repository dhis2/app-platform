import { Provider } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { get } from '../utils/api.js'
import { parseDHIS2ServerVersion, parseVersion } from '../utils/parseVersion.js'
import { LoadingMask } from './LoadingMask.js'
import { LoginModal } from './LoginModal.js'
import { useOfflineInterface } from './OfflineInterfaceContext.js'

export const ServerVersionProvider = ({
    appName,
    appVersion,
    url,
    apiVersion,
    pwaEnabled,
    children,
}) => {
    const offlineInterface = useOfflineInterface()
    const [{ loading, error, systemInfo }, setState] = useState({
        loading: true,
    })

    useEffect(() => {
        if (!url) {
            setState({ loading: false, error: new Error('No url specified') })
            return
        }

        setState((state) => (state.loading ? state : { loading: true }))
        const request = get(`${url}/api/system/info`)
        request
            .then((systemInfo) => {
                setState({ loading: false, systemInfo })
            })
            .catch((e) => {
                // Todo: If this is a network error, the app cannot load -- handle that gracefully here
                // if (e === 'Network error') { ... }
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

    const serverVersion = parseDHIS2ServerVersion(systemInfo.version)
    const realApiVersion = serverVersion.minor

    return (
        <Provider
            config={{
                appName,
                appVersion: parseVersion(appVersion),
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
    appName: PropTypes.string.isRequired,
    appVersion: PropTypes.string.isRequired,
    apiVersion: PropTypes.number,
    children: PropTypes.element,
    pwaEnabled: PropTypes.bool,
    url: PropTypes.string,
}
