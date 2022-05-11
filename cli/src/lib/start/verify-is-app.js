const { reporter, chalk } = require('@dhis2/cli-helpers-engine')

module.exports = function verifyIsApp(config) {
    if (config.type !== 'app') {
        reporter.error(
            `The command ${chalk.bold(
                'd2-app-scripts start'
            )} is not currently supported for libraries!`
        )
        process.exit(1)
    }
}
