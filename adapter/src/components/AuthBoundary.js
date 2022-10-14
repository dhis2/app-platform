import {
    useConfig,
    useDataQuery,
    clearSensitiveCaches,
} from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { LoadingMask } from './LoadingMask'

// TODO: Remove useVerifyLatestUser
// TODO: add actual appName to config; rename existing to appTitle (& refactor)
//       - will also need to change app-runtime and headerbar-ui APIs

const USER_QUERY = {
    user: {
        resource: 'me',
        params: { fields: ['id', 'authorities'] },
    },
}

const LATEST_USER_KEY = 'dhis2.latestUser'

const getRequiredAppAuthority = (appName) => {
    // TODO: this only works for installed, non-core apps. Need other logic for those (dhis-web-app-name)
    // Maybe add this logic to CLI add this to config, instead of needing more env vars here
    // Need 'coreApp', 'name', 'title' (rename current appName to appTitle)
    return (
        'M_' +
        appName
            .trim()
            .replaceAll(/[^a-zA-Z0-9\s]/g, '')
            .replaceAll(/\s/g, '_')
    )
}

async function clearCachesIfUserChanged({ currentUserId, pwaEnabled }) {
    const latestUserId = localStorage.getItem(LATEST_USER_KEY)
    if (currentUserId !== latestUserId) {
        const cachesCleared = await clearSensitiveCaches()
        localStorage.setItem(LATEST_USER_KEY, currentUserId)
        if (cachesCleared && pwaEnabled) {
            // If this is a PWA app, the app-shell cache will need to
            // be restored with a page reload
            return window.location.reload()
        }
    }
}

/**
 * This hook is used to clear sensitive caches if a user other than the one
 * that cached that data logs in
 * @returns {Object} - { loading: boolean }
 */
export function AuthBoundary({ children }) {
    const { pwaEnabled, appName } = useConfig()
    const [finished, setFinished] = useState(false)
    const { loading, error, data } = useDataQuery(USER_QUERY, {
        onComplete: async ({ user }) => {
            console.log({ authorities: user.authorities })

            await clearCachesIfUserChanged({
                currentUserId: user.id,
                pwaEnabled,
            })
            setFinished(true)
        },
    })

    if (loading || !finished) {
        return <LoadingMask />
    }

    if (error) {
        throw new Error('Failed to fetch user ID: ' + error)
    }

    if (data) {
        const userHasAllAuthority = data.user.authorities.includes('ALL')

        const requiredAppAuthority = getRequiredAppAuthority(appName)
        console.log({ requiredAppAuthority })

        const userHasRequiredAppAuthority =
            data.user.authorities.includes(requiredAppAuthority)
        if (!userHasAllAuthority && !userHasRequiredAppAuthority) {
            // TODO: better UI element than error boundary?
            throw new Error('Forbidden: not authorized to view this app')
        }
    }

    return children
}
AuthBoundary.propTypes = {
    children: PropTypes.node,
}
