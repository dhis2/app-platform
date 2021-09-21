import { identity } from 'lodash/fp'
import { checkAuthorities } from './checkAuthorities'
import { getAuthoritiesFromSchema } from './getAuthoritiesFromSchema'

/**
 * @param {Object} args
 * @param {Group} args.group
 * @param {Object} args.schemas
 * @param {Object} args.systemSettings
 * @param {string[]} userAuthorities
 * @param {bool} [args.noAuth]
 * @returns {bool}
 */
export const hasUserAuthorityForGroup = ({
    group,
    schemas,
    systemSettings,
    userAuthorities,
    noAuth,
}) => {
    if (noAuth || !systemSettings.keyRequireAddToView) return true

    const groupAuthorities = Object.entries(group.sections)
        // eslint-disable-next-line no-unused-vars
        .map(([key, { permissions, schemaName }]) => {
            // Static permissions in config files
            if (permissions) {
                return permissions
            }

            // If there are no static permissions extract them from the schemas
            if (schemas[schemaName]) {
                return getAuthoritiesFromSchema(schemas[schemaName])
            }

            // just in case there's no schema defined,
            // should never happen theoretically
            return null
        })
        // just in case there are neither permissions
        // nor a schema returned by the api defined
        .filter(identity)

    // User has authority for group if he has authority for any section inside
    return groupAuthorities.some(sectionAuthorities =>
        checkAuthorities(sectionAuthorities, userAuthorities)
    )
}
