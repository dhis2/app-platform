import { useConfig } from '@dhis2/app-runtime'
import { CenteredContent, NoticeBox } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import i18n from '../locales'

const IS_PRODUCTION_ENV = process.env.NODE_ENV === 'production'
const APP_MANAGER_AUTHORITY = 'M_dhis-web-maintenance-appmanager'
const APP_AUTH_NAME = process.env.REACT_APP_DHIS2_APP_AUTH_NAME
const LEGACY_APP_AUTH_NAME = process.env.REACT_APP_DHIS2_APP_LEGACY_AUTH_NAME

const isAppAvailable = ({ userAuthorities, apiVersion }) => {
    // Skip check on dev
    if (!IS_PRODUCTION_ENV) {
        return true
    }

    // On server versions < 35, auth name uses config.title instead of .name
    const requiredAppAuthority =
        apiVersion >= 35 ? APP_AUTH_NAME : LEGACY_APP_AUTH_NAME

    // Check for three possible authorities
    return userAuthorities.some((authority) =>
        ['ALL', APP_MANAGER_AUTHORITY, requiredAppAuthority].includes(authority)
    )
}

/**
 * Block the app if the user doesn't have the correct permissions to view this
 * app.
 */
export function AuthBoundary({ user, children }) {
    const { appName, apiVersion } = useConfig()

    return isAppAvailable({ userAuthorities: user.authorities, apiVersion }) ? (
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
