import {
    useConfig,
    useDataQuery,
    clearSensitiveCaches,
} from '@dhis2/app-runtime'
import { useState } from 'react'

const USER_QUERY = {
    user: {
        resource: 'me',
        params: { fields: ['id'] },
    },
}

const LATEST_USER_KEY = 'dhis2.latestUser'

/**
 * This hook is used to clear sensitive caches if a user other than the one
 * that cached that data logs in
 * @returns {Object} - { loading: boolean }
 */
export function useVerifyLatestUser() {
    const { pwaEnabled } = useConfig()
    const [finished, setFinished] = useState(false)
    const { loading, error } = useDataQuery(USER_QUERY, {
        onComplete: async (data) => {
            const latestUserId = localStorage.getItem(LATEST_USER_KEY)
            const currentUserId = data.user.id
            if (currentUserId !== latestUserId) {
                const cachesCleared = await clearSensitiveCaches()
                localStorage.setItem(LATEST_USER_KEY, currentUserId)
                if (cachesCleared && pwaEnabled) {
                    // If this is a PWA app, the app-shell cache will need to
                    // be restored with a page reload
                    return window.location.reload()
                }
            }
            setFinished(true)
        },
    })

    if (error) {
        throw new Error('Failed to fetch user ID: ' + error)
    }

    return { loading: loading || !finished }
}
