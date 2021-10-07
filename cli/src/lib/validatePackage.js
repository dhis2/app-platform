const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const { validateLockfile } = require('./validators/validateLockfile')
const {
    validatePackageExports,
} = require('./validators/validatePackageExports')

module.exports.validatePackage = async ({
    config,
    paths,
    offerFix = true,
    noVerify = false,
} = {}) => {
    if (noVerify) {
        reporter.print(chalk.dim('Skipping package validation (--no-verify)'))
        return true
    }

    let pkg
    try {
        pkg = fs.readJsonSync(paths.package)
    } catch (e) {
        reporter.error(`Failed to load package manifest at ${paths.package}`)
        return false
    }

    reporter.debug('Validating package...', { pkg, offerFix, noVerify })

    const validators = [validatePackageExports, validateLockfile]
    for (const validator of validators) {
        if (!(await validator(pkg, { config, paths, offerFix }))) {
            return false
        }
    }
    return true
}
