const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const detectPort = require('detect-port')
const { compile } = require('../lib/compiler')
const exitOnCatch = require('../lib/exitOnCatch')
const generateManifests = require('../lib/generateManifests')
const { getOriginalEntrypoints } = require('../lib/getOriginalEntrypoints')
const i18n = require('../lib/i18n')
const loadEnvFiles = require('../lib/loadEnvFiles')
const parseConfig = require('../lib/parseConfig')
const { isApp } = require('../lib/parseConfig')
const makePaths = require('../lib/paths')
const makePlugin = require('../lib/plugin')
const createProxyServer = require('../lib/proxy')
const { compileServiceWorker } = require('../lib/pwa')
const makeShell = require('../lib/shell')
const { validatePackage } = require('../lib/validatePackage')

const defaultPort = 3000

const handler = async ({
    cwd,
    force,
    port = process.env.PORT || defaultPort,
    shell: shellSource,
    proxy,
    proxyPort,
    app: shouldStartOnlyApp,
    plugin: shouldStartOnlyPlugin,
}) => {
    const paths = makePaths(cwd)

    const mode = 'development'
    process.env.BABEL_ENV = process.env.NODE_ENV = mode
    loadEnvFiles(paths, mode)

    const config = parseConfig(paths)
    const shell = makeShell({ config, paths })
    const plugin = makePlugin({ config, paths })

    if (!isApp(config.type)) {
        reporter.error(
            `The command ${chalk.bold(
                'd2-app-scripts start'
            )} is not currently supported for libraries!`
        )
        process.exit(1)
    }

    const newPort = await detectPort(port)

    if (proxy) {
        const newProxyPort = await detectPort(proxyPort)
        const proxyBaseUrl = `http://localhost:${newProxyPort}`

        reporter.print('')
        reporter.info('Starting proxy server...')
        reporter.print(
            `The proxy for ${chalk.bold(
                proxy
            )} is now available on port ${newProxyPort}`
        )
        reporter.print('')

        createProxyServer({
            target: proxy,
            baseUrl: proxyBaseUrl,
            port: newProxyPort,
            shellPort: newPort,
        })
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

            if (String(newPort) !== String(port)) {
                reporter.print('')
                reporter.warn(
                    `Something is already running on port ${port}, using ${newPort} instead.`
                )
            }

            if (config.pwa.enabled) {
                reporter.info('Compiling service worker...')
                await compileServiceWorker({ config, paths, mode })
                // don't need to inject precache manifest because no precaching
                // is done in development environments
            }

            reporter.print('')
            reporter.info('Starting development server...')

            // start app and/or plugin, depending on flags

            // entryPoints.app is populated by default -- get the app's raw
            // entry points from the d2.config.js file to tell if there is an
            // app entrypoint configured (and fall back to the whatever we do
            // have available)
            const entryPoints =
                getOriginalEntrypoints(paths) || config.entryPoints

            const noFlagsPassed = !shouldStartOnlyApp && !shouldStartOnlyPlugin
            const shouldStartApp =
                entryPoints.app && (noFlagsPassed || shouldStartOnlyApp)
            const shouldStartPlugin =
                entryPoints.plugin && (noFlagsPassed || shouldStartOnlyPlugin)

            if (!shouldStartApp && !shouldStartPlugin) {
                throw new Error(
                    'The requested app/plugin is not configured to start. Check the flags passed to the start script and the entrypoints configured in d2.config.js, then try again.'
                )
            }

            const startPromises = []
            if (shouldStartApp) {
                reporter.print(
                    `The app ${chalk.bold(
                        config.name
                    )} is now available on port ${newPort}`
                )
                reporter.print('')
                startPromises.push(shell.start({ port: newPort }))
            }

            if (shouldStartPlugin) {
                const pluginPort = shouldStartApp ? newPort + 1 : newPort
                reporter.print(
                    `The plugin is now available on port ${pluginPort} at /${paths.pluginLaunchPath}`
                )
                reporter.print('')
                startPromises.push(plugin.start({ port: pluginPort }))
            }

            await Promise.all(startPromises)
        },
        {
            name: 'start',
            onError: (err) => {
                reporter.error(err)
                reporter.error('Start script exited with non-zero exit code')
            },
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
        proxy: {
            alias: 'P',
            type: 'string',
            description: 'The remote DHIS2 instance the proxy should point to',
        },
        proxyPort: {
            type: 'number',
            description: 'The port to use when running the proxy',
            default: 8080,
        },
        // todo: change with Vite
        app: {
            type: 'boolean',
            description:
                'Start a dev server for just the app entrypoint (instead of both app and plugin, if this app has a plugin)',
        },
        plugin: {
            type: 'boolean',
            description: 'Start a dev server for just the plugin entrypoint',
        },
    },
    handler,
}

module.exports = command
