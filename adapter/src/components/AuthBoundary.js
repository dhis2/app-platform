import {
    useConfig,
    useDataQuery,
    clearSensitiveCaches,
} from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { LoadingMask } from './LoadingMask'

// TODO: Remove useVerifyLatestUser.js (and in app wrapper)

const LATEST_USER_KEY = 'dhis2.latestUser'
const IS_PRODUCTION_ENV = process.env.NODE_ENV === 'production'

const APP_MANAGER_AUTHORITY = 'M_dhis-web-maintenance-appmanager'
const REQUIRED_APP_AUTHORITY = process.env.REACT_APP_DHIS2_APP_AUTH_NAME

const USER_QUERY = {
    user: {
        resource: 'me',
        params: { fields: ['id', 'authorities'] },
    },
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

const isAppAvailable = (authorities) => {
    // Skip check on dev
    // TODO: should we check on dev environments too?
    if (!IS_PRODUCTION_ENV) {
        return true
    }
    // Check for three possible authorities
    return authorities.some((authority) =>
        ['ALL', APP_MANAGER_AUTHORITY, REQUIRED_APP_AUTHORITY].includes(
            authority
        )
    )
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

    if (isAppAvailable(data.user.authorities)) {
        return children
    } else {
        throw new Error(
            `Forbidden: you don't have access to the ${appName} app`
        )
    }
}
AuthBoundary.propTypes = {
    children: PropTypes.node,
}
