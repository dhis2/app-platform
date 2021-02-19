const { reporter, chalk, exec } = require('@dhis2/cli-helpers-engine')

module.exports.validateYarnVersion = async ({ paths }) => {
    try {
        const yarnVersion = (
            await exec({
                cmd: 'yarn',
                args: ['--version'],
                cwd: paths.base,
                captureOut: true,
            })
        ).trim()
        if (parseInt(yarnVersion.split('.')[0]) < 2) {
            reporter.warn(
                chalk.dim(
                    'Modern yarn (v2) is recommendedx but not currently required.\nVisit https://yarnpkg.com/getting-started/migration for more information'
                )
            )
        }
        reporter.debug(`Found yarn version ${yarnVersion}`)
    } catch (e) {
        reporter.error('Yarn is required, please visit https://yarnpkg.com', e)
        return false
    }
}
