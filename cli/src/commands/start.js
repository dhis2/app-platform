const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const detectPort = require('detect-port')
const { compile } = require('../lib/compiler')
const exitOnCatch = require('../lib/exitOnCatch')
const generateManifests = require('../lib/generateManifests')
const i18n = require('../lib/i18n')
const loadEnvFiles = require('../lib/loadEnvFiles')
const parseConfig = require('../lib/parseConfig')
const makePaths = require('../lib/paths')
const { compileServiceWorker } = require('../lib/pwa')
const makeShell = require('../lib/shell')
const { validatePackage } = require('../lib/validatePackage')

const defaultPort = 3000

const handler = async ({
    cwd,
    force,
    port = process.env.PORT || defaultPort,
    shell: shellSource,
}) => {
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

            reporter.info('Generating internationalization strings...')
            await i18n.extract({
                input: paths.src,
                output: paths.i18nStrings,
                paths,
            })
            await i18n.generate({
                input: paths.i18nStrings,
                output: paths.i18nLocales,
                namespace: 'default',
                paths,
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

            // Manifests added here so app has access to manifest.json for pwa
            reporter.info('Generating manifests...')
            await generateManifests(paths, config, process.env.PUBLIC_URL)

            const newPort = await detectPort(port)
            if (String(newPort) !== String(port)) {
                reporter.print('')
                reporter.warn(
                    `Something is already running on port ${port}, using ${newPort} instead.`
                )
            }

            if (config.pwa.enabled) {
                reporter.info('Compiling service worker...')
                await compileServiceWorker({
                    config,
                    paths,
                    mode: 'development',
                })
            }

            reporter.print('')
            reporter.info('Starting development server...')
            reporter.print(
                `The app ${chalk.bold(
                    config.name
                )} is now available on port ${newPort}`
            )
            reporter.print('')

            await shell.start({ port: newPort })
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
    desc: 'Start a development server running a DHIS2 app within the DHIS2 app-shell',
    builder: {
        port: {
            alias: 'p',
            type: 'number',
            description: 'The port to use when running the development server',
        },
    },
    handler,
}

module.exports = command
