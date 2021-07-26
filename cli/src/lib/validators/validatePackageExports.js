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

const checkField = (field, value, expectedValue) => {
    if (!value) {
        reporter.warn(`package.json is missing "${field}" field`)
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

const getExpectedExports = (entrypoint, paths) => {
    if (typeof entrypoint === 'string') {
        const baseDir = path.dirname(paths.package)
        const relativeEntrypoint = path.relative(
            paths.src,
            normalizeExtension(entrypoint)
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
        return {
            import: expectedESMExport,
            require: expectedCJSExport,
        }
    }
    return Object.entries(entrypoint).reduce((acc, [key, value]) => {
        acc[key] = getExpectedExports(value, paths)
        return acc
    }, {})
}

const validateSingleEntrypoint = (pkg, { config, paths }) => {
    const expectedExports = getExpectedExports(config.entryPoints.lib, paths)
    const expectedPackage = {
        main: expectedExports.require,
        module: expectedExports.import,
        exports: expectedExports,
    }

    let valid = true
    valid &= checkField('main', pkg.main, expectedPackage.main)
    valid &= checkField('module', pkg.module, expectedPackage.module)

    if (typeof pkg.exports === 'string') {
        valid &= checkField('exports', pkg.exports, [
            expectedExports.require,
            expectedExports.import,
        ])
    } else if (pkg.exports) {
        const exportContext = pkg.exports['.'] || pkg.exports
        const fieldPrefix = pkg.exports['.'] ? `exports['.'].` : 'exports.'
        valid &= checkField(
            fieldPrefix + 'import',
            exportContext.import,
            expectedExports.import
        )
        valid &= checkField(
            fieldPrefix + 'require',
            exportContext.require,
            expectedExports.require
        )
    } else {
        reporter.warn('package.json is missing "exports" field')
        valid = false
    }

    return { valid, expectedPackage }
}

const validateMultipleEntrypoints = (pkg, { config, paths }) => {
    const expectedExports = getExpectedExports(config.entryPoints.lib, paths)
    const expectedPackage = {
        exports: expectedExports,
    }
    if (expectedExports['.']) {
        if (expectedExports['.'].import) {
            expectedPackage.module = expectedExports['.'].import
        }
        if (expectedExports['.'].require) {
            expectedPackage.main = expectedExports['.'].require
        }
    }

    let valid = true
    if (expectedPackage.main) {
        valid &= checkField('main', pkg.main, expectedPackage.main)
    }
    if (expectedPackage.module) {
        valid &= checkField('module', pkg.module, expectedPackage.module)
    }

    if (typeof pkg.exports === 'string') {
        reporter.warn(
            'The "exports" field cannot be a string if multiple entrypoints are defined'
        )
        valid = false
    } else if (pkg.exports) {
        const checkNestedExports = (expectedExports, context) => {
            Object.entries(expectedExports).forEach(
                ([field, expectedValue]) => {
                    if (expectedValue.import && expectedValue.require) {
                        valid &= checkField(
                            `${context.path}['${field}'].import`,
                            context.value[field] && context.value[field].import,
                            expectedValue.import
                        )
                        valid &= checkField(
                            `${context.path}['${field}'].require`,
                            context.value[field] &&
                                context.value[field].require,
                            expectedValue.require
                        )
                    } else {
                        checkNestedExports(expectedValue, {
                            path: `${context.path}['${field}']`,
                            value: context.value[field],
                        })
                    }
                }
            )
        }
        checkNestedExports(expectedExports, {
            path: 'exports',
            value: pkg.exports,
        })
    } else {
        reporter.warn('package.json is missing "exports" field')
        valid = false
    }

    return { valid, expectedPackage }
}

module.exports.validatePackageExports = async (
    pkg,
    { config, paths, offerFix }
) => {
    if (config.type !== 'lib' || !config.entryPoints.lib) {
        return true
    }

    const { valid, expectedPackage } =
        typeof config.entryPoints.lib === 'string'
            ? validateSingleEntrypoint(pkg, { config, paths })
            : validateMultipleEntrypoints(pkg, { config, paths })

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
        return true
    }
    return !!valid
}
