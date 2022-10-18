import { useConfig } from '@dhis2/app-runtime'
import { CenteredContent, NoticeBox } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import i18n from '../locales'

const IS_PRODUCTION_ENV = process.env.NODE_ENV === 'production'
const APP_MANAGER_AUTHORITY = 'M_dhis-web-maintenance-appmanager'
const REQUIRED_APP_AUTHORITY = process.env.REACT_APP_DHIS2_APP_AUTH_NAME

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
 * Block the app if the user doesn't have the correct permissions to view this
 * app.
 */
export function AuthBoundary({ user, children }) {
    const { appName } = useConfig()

    return isAppAvailable(user.authorities) ? (
        children
    ) : (
        <CenteredContent>
            <NoticeBox
                error
                title={i18n.t("You don't have access to the {{appName}} app", {
                    appName,
                })}
            >
                {i18n.t(
                    'Contact your system administrator for assistance with app access.'
                )}
            </NoticeBox>
        </CenteredContent>
    )
}
AuthBoundary.propTypes = {
    children: PropTypes.node,
    user: PropTypes.shape({
        authorities: PropTypes.arrayOf(PropTypes.string),
    }),
}
