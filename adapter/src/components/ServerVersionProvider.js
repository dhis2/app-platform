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
    loginApp,
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

        // in reality we probably want a request to get api version
        if (loginApp) {
            const fakeSystemInfo = { version: '2.40-SNAPSHOT' }
            setState({ loading: false, systemInfo: fakeSystemInfo })
            return
        }
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
    }, [url, loginApp])

    if (loading) {
        return <LoadingMask />
    }

    if (error) {
        return !loginApp ? (
            <LoginModal />
        ) : (
            <p>Specify DHIS2_BASE_URL environment variable</p>
        )
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
            offlineInterface={loginApp ? null : offlineInterface}
            loginApp={loginApp}
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
    loginApp: PropTypes.bool,
    pwaEnabled: PropTypes.bool,
    url: PropTypes.string,
}
