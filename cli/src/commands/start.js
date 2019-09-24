const { reporter } = require('@dhis2/cli-helpers-engine')
const chalk = require('chalk')

const i18n = require('../lib/i18n')
const compile = require('../lib/compile')
const makePaths = require('../lib/paths')
const makeShell = require('../lib/shell')
const parseConfig = require('../lib/parseConfig')
const exitOnCatch = require('../lib/exitOnCatch')
const loadEnvFiles = require('../lib/loadEnvFiles')
const { getShellPort } = require('../lib/shell/env')

const handler = async ({ cwd, force, shell: shellSource }) => {
    const paths = makePaths(cwd)

    const mode = 'development'
    loadEnvFiles(paths, mode)

    const config = parseConfig(paths)
    const shell = makeShell({ config, paths })

    if (config.type !== 'app') {
        reporter.error(
            `The command ${chalk.bold(
                'd2-app-scripts start'
            )} is not currently supported for libraries!`
        )
        process.exit(1)
    }

    await exitOnCatch(
        async () => {
            reporter.info('Generating internationalization strings...')
            await i18n.extract({ input: paths.src, output: paths.i18nStrings })
            await i18n.generate({
                input: paths.i18nStrings,
                output: paths.i18nLocales,
                namespace: config.name || 'default',
            })

            reporter.info('Bootstrapping local appShell...')
            await shell.bootstrap({ shell: shellSource, force })

            reporter.info(`Building app ${chalk.bold(config.name)}...`)
            await compile({
                config,
                mode,
                paths,
                watch: true,
            })

            reporter.print(chalk.dim('\n---\n'))
            reporter.info('Starting development server...')
            reporter.print(
                `The app ${chalk.bold(
                    config.name
                )} is now available on port ${getShellPort()}`
            )
            reporter.print(chalk.dim('\n---\n'))
            await shell.start()
        },
        {
            name: 'start',
            onError: () =>
                reporter.error('Start script exited with non-zero exit code'),
        }
    )
}

const command = {
    command: 'start',
    aliases: 's',
    desc:
        'Start a development server running a DHIS2 app within the DHIS2 app-shell',
    handler,
}

module.exports = command
