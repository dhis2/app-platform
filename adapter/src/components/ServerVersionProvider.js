import { Provider } from '@dhis2/app-runtime'
import { getBaseUrlByAppName } from '@dhis2/pwa/src/lib/base-url-db'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { get } from '../utils/api.js'
import { parseServerVersion } from '../utils/parseServerVersion.js'
import { LoadingMask } from './LoadingMask.js'
import { LoginModal } from './LoginModal.js'

export const ServerVersionProvider = ({
    url, // URL from env vars
    appName,
    apiVersion,
    offlineInterface,
    pwaEnabled,
    children,
}) => {
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
            setBaseUrlState(state =>
                state.loading ? state : { loading: true }
            )
            // try getting URL from IndexedDB
            getBaseUrlByAppName(appName)
                .then(baseUrlFromDB => {
                    // If still no URL found, set error to show login modal
                    if (!baseUrlFromDB) {
                        setBaseUrlState({
                            loading: false,
                            error: new Error('No url specified'),
                        })
                        return
                    }
                    // Otherwise, set baseUrl in state
                    setBaseUrlState({
                        loading: false,
                        baseUrl: baseUrlFromDB,
                    })
                })
                .catch(err => {
                    console.error(err)
                    setBaseUrlState({ loading: false, error: err })
                })

            return
        }

        // If url IS set, try querying API to test authentication and get
        // server version. If it fails, set error to show login modal

        setSystemInfoState(state => (state.loading ? state : { loading: true }))
        const request = get(`${baseUrl}/api/system/info`)
        request
            .then(systemInfo => {
                setSystemInfoState({ loading: false, systemInfo })
            })
            .catch(e => {
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

    const serverVersion = parseServerVersion(systemInfo.version)
    const realApiVersion = serverVersion.minor

    return (
        <Provider
            config={{
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
    apiVersion: PropTypes.number,
    appName: PropTypes.string,
    children: PropTypes.element,
    offlineInterface: PropTypes.shape({}),
    pwaEnabled: PropTypes.bool,
    url: PropTypes.string,
}
