const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const { validatePackage } = require('../validatePackage')

module.exports = async function notifyWhenPackageInvalid(config, paths) {
    if (!(await validatePackage({ config, paths, offerFix: false }))) {
        reporter.print(
            'Package validation issues are ignored when running "d2-app-scripts start"'
        )
        reporter.print(
            `${chalk.bold(
                'HINT'
            )}: Run "d2-app-scripts build" to automatically fix some of these issues`
        )
    }
}
