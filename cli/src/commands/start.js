const { reporter } = require('@dhis2/cli-helpers-engine')
const detectPort = require('detect-port')
const exitOnCatch = require('../lib/exitOnCatch')
const generateManifests = require('../lib/generateManifests')
const i18n = require('../lib/i18n/index.js')
const {
    createLocalProxyServer,
    notifyWhenPackageInvalid,
    verifyIsApp,
    craStart,
} = require('../lib/index.js')
const loadEnvFiles = require('../lib/loadEnvFiles')
const parseConfig = require('../lib/parseConfig')
const makePaths = require('../lib/paths')

const defaultPort = 3000

const handler = ({
    cwd,
    port = process.env.PORT || defaultPort,
    proxy,
    proxyPort,
    verbose,
}) =>
    exitOnCatch(
        async () => {
            const mode = 'development'
            const paths = makePaths(cwd)

            loadEnvFiles(paths, mode)

            const config = parseConfig(paths)

            verifyIsApp(config)

            const appPort = await detectPort(port)

            await createLocalProxyServer({ proxy, proxyPort, appPort })
            await notifyWhenPackageInvalid(config, paths)

            reporter.info('Generating internationalization strings...')
            await i18n.extractAndGenerate(paths)

            // Manifests added here so app has access to manifest.json for pwa
            reporter.info('Generating manifests...')
            await generateManifests(paths, config, process.env.PUBLIC_URL)

            if (String(appPort) !== String(port)) {
                reporter.print('')
                reporter.warn(
                    `Something is already running on port ${port}, using ${appPort} instead.`
                )
            }

            // @TODO: Figure out how to do this properly
            // const { compileServiceWorker } = require('../lib/pwa')
            // if (config.pwa.enabled) {
            //     reporter.info('Compiling service worker...')
            //     await compileServiceWorker({
            //         config,
            //         paths,
            //         mode: 'development',
            //     })
            // }

            try {
                await craStart({ port, cwd: paths.base, config, verbose })
            } catch (code) {
                process.exit(code)
            }
        },
        {
            name: 'start',
            onError: () =>
                reporter.error('Start script exited with non-zero exit code'),
        }
    )

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
    },
    handler,
}

module.exports = command
