const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
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

    return await validatePackageExports(pkg, { config, paths, offerFix })
}
