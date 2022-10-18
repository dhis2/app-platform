import { Provider } from '@dhis2/app-runtime'
import { getBaseUrlByAppName, setBaseUrlByAppName } from '@dhis2/pwa'
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
    url, // url from env vars
    apiVersion,
    pwaEnabled,
    children,
}) => {
    const offlineInterface = useOfflineInterface()
    const [systemInfoState, setSystemInfoState] = useState({
        loading: true,
    })
    const [baseUrlState, setBaseUrlState] = useState({
        loading: !url,
        error: null,
        baseUrl: url,
    })
    const { systemInfo } = systemInfoState
    const { baseUrl } = baseUrlState

    useEffect(() => {
        // if URL prop is not set, set state to error to show login modal.
        // Submitting valid login form with server and credentials reloads page,
        // ostensibly with a filled url prop (now persisted locally)
        if (!baseUrl) {
            setBaseUrlState((state) =>
                state.loading ? state : { loading: true }
            )
            // try getting URL from IndexedDB
            getBaseUrlByAppName(appName)
                .then((baseUrlFromDB) => {
                    if (baseUrlFromDB) {
                        // Set baseUrl in state if found in DB
                        setBaseUrlState({
                            loading: false,
                            baseUrl: baseUrlFromDB,
                        })
                        return
                    }
                    // If no URL found in DB, try localStorage
                    // TODO: deprecate
                    const baseUrlFromLocalStorage =
                        window.localStorage.DHIS2_BASE_URL
                    if (baseUrlFromLocalStorage) {
                        setBaseUrlState({
                            loading: false,
                            baseUrl: baseUrlFromLocalStorage,
                        })
                        // Also set it in IndexedDB for SW to access
                        return setBaseUrlByAppName({
                            appName,
                            baseUrl: baseUrlFromLocalStorage,
                        })
                    }
                    // If no base URL found in either, set error to show login modal
                    setBaseUrlState({
                        loading: false,
                        error: new Error('No url specified'),
                    })
                })
                .catch((err) => {
                    console.error(err)
                    setBaseUrlState({ loading: false, error: err })
                })

            return
        }

        // If url IS set, try querying API to test authentication and get
        // server version. If it fails, set error to show login modal

        setSystemInfoState((state) =>
            state.loading ? state : { loading: true }
        )
        const request = get(`${baseUrl}/api/system/info`)
        request
            .then((systemInfo) => {
                setSystemInfoState({ loading: false, systemInfo })
            })
            .catch((e) => {
                setSystemInfoState({ loading: false, error: e })
            })

        return () => {
            request.abort()
        }
    }, [baseUrl])

    // This needs to come before 'loading' case to show modal at correct times
    if (systemInfoState.error || baseUrlState.error) {
        return <LoginModal appName={appName} baseUrl={baseUrl} />
    }

    if (systemInfoState.loading || baseUrlState.loading) {
        return <LoadingMask />
    }

    const serverVersion = parseDHIS2ServerVersion(systemInfo.version)
    const realApiVersion = serverVersion.minor

    return (
        <Provider
            config={{
                appName,
                appVersion: parseVersion(appVersion),
                baseUrl,
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
