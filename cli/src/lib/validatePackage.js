const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const {
    validatePackageExports,
} = require('./validators/validatePackageExports')
// const { validateSingletonDependencies } = require('./validators/validateSingletonDependnecies')
// const { validateYarnVersion } = require('./validators/validateYarnVersion')

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
        pkg = require(paths.package)
    } catch (e) {
        reporter.error(`Failed to load package manifest at ${paths.package}`)
        return false
    }

    reporter.debug('Validating package...', { pkg, offerFix, noVerify })

    return (
        // await validateYarnVersion({ paths }) &&
        // await validateSingletonDependencies(pkg, { paths, offerFix }) &&
        await validatePackageExports(pkg, { config, paths, offerFix })
    )
}
