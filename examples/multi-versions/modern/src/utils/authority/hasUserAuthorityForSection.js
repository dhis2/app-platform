import { checkAuthorities } from './checkAuthorities'
import { getAuthoritiesFromSchema } from './getAuthoritiesFromSchema'

/**
 * @param {Object} args
 * @param {Section} args.section
 * @param {string[]} args.userAuthorities
 * @param {Object} args.systemSettings
 * @param {Object} [args.schemas]
 */
export const hasUserAuthorityForSection = ({
    section,
    userAuthorities,
    systemSettings,
    schemas,
}) => {
    const { permissions, schemaName } = section
    const schema = schemas && schemas[schemaName]
    const requiredPrivileges = schema
        ? getAuthoritiesFromSchema(schema)
        : permissions

    return (
        !systemSettings.keyRequireAddToView ||
        checkAuthorities(requiredPrivileges, userAuthorities)
    )
}
