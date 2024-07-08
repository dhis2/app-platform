const { reporter, chalk } = require('@dhis2/cli-helpers-engine')

const parseAdditionalNamespaces = (additionalNamespaces) => {
    if (!additionalNamespaces) {
        return undefined
    }
    if (!Array.isArray(additionalNamespaces)) {
        reporter.warn(
            `Invalid value ${chalk.bold(
                JSON.stringify(additionalNamespaces)
            )} specified for ${chalk.bold(
                'additionalNamespaces'
            )} -- must be an array of objects, skipping.`
        )
        return undefined
    }

    const filteredNamespaces = additionalNamespaces.filter(
        (additionalNamespace, index) => {
            const msg = `Invalid namespace ${chalk.bold(
                JSON.stringify(additionalNamespace)
            )} specified at ${chalk.bold(`index ${index}`)} of ${chalk.bold(
                'additionalNamespaces'
            )} -- see d2.config.js documentation for the correct form. Skipping.`
            const {
                namespace,
                authorities,
                readAuthorities,
                writeAuthorities,
            } = additionalNamespace

            const namespacePropIsString = typeof namespace === 'string'
            const definedAuthsProps = [
                authorities,
                readAuthorities,
                writeAuthorities,
            ].filter((auths) => auths !== undefined)
            const definedAuthsPropsAreValid =
                Array.isArray(definedAuthsProps) &&
                definedAuthsProps.every(
                    (auths) =>
                        Array.isArray(auths) &&
                        auths.every((auth) => typeof auth === 'string')
                )

            const additionalNamespaceIsValid =
                namespacePropIsString &&
                definedAuthsProps.length > 0 &&
                definedAuthsPropsAreValid
            if (!additionalNamespaceIsValid) {
                reporter.warn(msg)
                return false // skip this additional namespace
            }

            return true
        }
    )

    return filteredNamespaces
}

exports.parseAdditionalNamespaces = parseAdditionalNamespaces
