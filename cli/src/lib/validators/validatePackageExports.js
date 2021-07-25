const path = require('path')
const { reporter, prompt } = require('@dhis2/cli-helpers-engine')
const { writeJSON } = require('fs-extra')
const { normalizeExtension } = require('../compiler/extensionHelpers.js')

/*
 * Ensure that package.main, package.module, and package.exports are valid
 */

const fixPackage = async (pkg, expectedPackage, { paths }) => {
    const newPkg = {
        ...pkg,
        ...expectedPackage,
        exports: {
            ...pkg.exports,
            ...expectedPackage.exports,
        },
    }

    await writeJSON(paths.package, newPkg, { spaces: 4 })
}

module.exports.validatePackageExports = async (
    pkg,
    { config, paths, offerFix }
) => {
    if (config.type !== 'lib' || !config.entryPoints.lib) {
        return true
    }

    const baseDir = path.dirname(paths.package)

    let valid = true
    const relativeEntrypoint = path.relative(
        paths.src,
        normalizeExtension(config.entryPoints.lib)
    )

    const expectedESMExport =
        './' +
        path.relative(
            baseDir,
            path.join(paths.buildOutput, 'es', relativeEntrypoint)
        )
    const expectedCJSExport =
        './' +
        path.relative(
            baseDir,
            path.join(paths.buildOutput, 'cjs', relativeEntrypoint)
        )

    const expectedPackage = {
        main: expectedCJSExport,
        module: expectedESMExport,
        exports: {
            import: expectedESMExport,
            require: expectedCJSExport,
        },
    }

    const checkField = (field, value, expectedValue) => {
        if (!value) {
            reporter.warn(`Package.json is missing "${field}" field`)
            return false
        }
        if (Array.isArray(expectedValue) && !expectedValue.includes(value)) {
            reporter.warn(
                `Invalid "${field}" field in package.json, expected ${expectedValue
                    .map(option => `"${option}"`)
                    .join(' or ')} (got "${value}")`
            )
            return false
        } else if (!Array.isArray(expectedValue) && value !== expectedValue) {
            reporter.warn(
                `Invalid "${field}" field in package.json, expected "${expectedValue}" (got "${value}")`
            )
            return false
        }
        return true
    }

    valid &= checkField('main', pkg.main, expectedCJSExport)
    valid &= checkField('module', pkg.module, expectedESMExport)

    if (typeof pkg.exports === 'string') {
        valid &=
            checkField('pkg.exports', pkg.exports, [
                expectedCJSExport,
                expectedESMExport,
            ]) || checkField('pkg.exports', pkg.exports, expectedESMExport)
    } else if (pkg.exports) {
        const exportContext = pkg.exports['.'] || pkg.exports
        const fieldPrefix = pkg.exports['.']
            ? 'pkg.exports[.].'
            : 'pkg.exports.'
        valid &= checkField(
            fieldPrefix + 'import',
            exportContext.import,
            expectedESMExport
        )
        valid &= checkField(
            fieldPrefix + 'require',
            exportContext.require,
            expectedCJSExport
        )
    } else {
        reporter.warn(`Package.json is missing "exports" field`)
        valid = false
    }

    if (!valid && offerFix) {
        const { fix } = await prompt({
            name: 'fix',
            type: 'confirm',
            message:
                'There are invalid or missing export declarations in package.json, would you like to correct them now?',
        })

        if (!fix) {
            return false
        }
        await fixPackage(pkg, expectedPackage, { paths })
        valid = true
    }
    return !!valid
}
