import {
    useConfig,
    useDataQuery,
    clearSensitiveCaches,
} from '@dhis2/app-runtime'
import { CenteredContent, NoticeBox } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import i18n from '../locales'
import { LoadingMask } from './LoadingMask'
import styles from './styles/ErrorBoundary.style.js'

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

const ForbiddenScreen = ({ appName, baseUrl }) => {
    return (
        <div className="mask fullscreen">
            <style jsx>{styles}</style>
            <CenteredContent>
                <NoticeBox error title={i18n.t('Forbidden')}>
                    <div>
                        {i18n.t(
                            "You don't have access to the {{appName}} app. Contact your system administrator if this seems to be an error.",
                            { appName }
                        )}
                    </div>
                    <div>
                        <a href={baseUrl}>{i18n.t('Return to DHIS2 Home')}</a>
                    </div>
                </NoticeBox>
            </CenteredContent>
        </div>
    )
}
ForbiddenScreen.propTypes = {
    appName: PropTypes.string,
    baseUrl: PropTypes.string,
}

/**
 * This hook is used to clear sensitive caches if a user other than the one
 * that cached that data logs in
 * @returns {Object} - { loading: boolean }
 */
export function AuthBoundary({ children }) {
    const { pwaEnabled, appName, baseUrl } = useConfig()
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

    return isAppAvailable(data.user.authorities) ? (
        children
    ) : (
        <ForbiddenScreen appName={appName} baseUrl={baseUrl} />
    )
}
AuthBoundary.propTypes = {
    children: PropTypes.node,
}
