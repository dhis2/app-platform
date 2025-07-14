const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const detectPort = require('detect-port')
const fs = require('fs-extra')
const bootstrapShell = require('../lib/bootstrapShell')
const { compile } = require('../lib/compiler')
const { loadEnvFiles, getEnv } = require('../lib/env')
const exitOnCatch = require('../lib/exitOnCatch')
const generateManifests = require('../lib/generateManifests')
const i18n = require('../lib/i18n')
const parseConfig = require('../lib/parseConfig')
const { isApp } = require('../lib/parseConfig')
const makePaths = require('../lib/paths')
const createProxyServer = require('../lib/proxy')
const { compileServiceWorker } = require('../lib/pwa')
const { validatePackage } = require('../lib/validatePackage')

const defaultPort = 3000

const handler = async ({
    cwd,
    force,
    port = process.env.PORT || defaultPort,
    shell: shellSource,
    proxy,
    proxyPort,
    host,
    allowJsxInJs,
}) => {
    // infer whether this is a TS project based on whether it contains a tsconfig
    const typeScript = fs.existsSync(
        path.join(cwd ?? process.cwd(), './tsconfig.json')
    )

    if (typeScript) {
        reporter.debug('starting a TypeScript project')
    }

    const paths = makePaths(cwd, { typeScript })

    const mode = 'development'
    process.env.BABEL_ENV = process.env.NODE_ENV = mode
    loadEnvFiles(paths, mode)

    /** @type {import('../index').D2Config} */
    const config = parseConfig(paths)

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

    return await exitOnCatch(
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
            await bootstrapShell({ paths, shell: shellSource, force })

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

            const env = getEnv({ config, publicUrl: '.' })

            if (config.pwa?.enabled) {
                reporter.info('Compiling service worker...')
                await compileServiceWorker({ env, paths, mode })
                // don't need to inject precache manifest because no precaching
                // is done in development environments
            }

            reporter.print('')
            reporter.info('Starting development server...')

            // These imports are done asynchronously to allow Vite to use its
            // ESM build of its Node API (the CJS build will be removed in v6)
            // https://vitejs.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated
            const { createServer } = await import('vite')
            const { default: createConfig } = await import(
                '../../config/makeViteConfig.mjs'
            )
            if (allowJsxInJs) {
                reporter.warn(
                    'Adding Vite config to allow JSX syntax in .js files. This is deprecated and will be removed in future versions.'
                )
                reporter.warn(
                    'Consider using the migration script `yarn d2-app-scripts migrate js-to-jsx` to rename your files to use .jsx extensions.'
                )
            }
            const viteConfig = await createConfig({
                config,
                paths,
                env,
                mode,
                host,
                force,
                allowJsxInJs,
            })
            const server = await createServer(viteConfig)

            let location = ''
            if (config.entryPoints.plugin) {
                location = config.entryPoints.app
                    ? ' at / and /plugin.html'
                    : ' at /plugin.html'
            }

            reporter.print(
                `The app ${chalk.bold(
                    config.name
                )} is now available on port ${newPort}${location}`
            )
            reporter.print('')
            await server.listen({ port: newPort })

            // Avoids clunky exit after Ctrl-C with bindCLIShortcuts:
            // (q+Enter works great with the CLI shortcuts either way)
            process.on('SIGINT', async function () {
                await server.close()
                process.exit(0)
            })
            // Useful CLI output and interaction:
            server.printUrls()
            server.bindCLIShortcuts({ print: true })
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
        force: {
            type: 'boolean',
            description:
                'Force updating the app shell; normally, this is only done when a new version of @dhis2/cli-app-scripts is detected. Also passes the --force option to the Vite server to reoptimize dependencies',
        },
        port: {
            alias: 'p',
            type: 'number',
            description: 'The port to use when running the development server',
            default: defaultPort,
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
        host: {
            type: 'boolean|string',
            description:
                'Exposes the server on the local network. Can optionally provide an address to use. [boolean or string]',
        },
        allowJsxInJs: {
            type: 'boolean',
            description:
                'Add Vite config to handle JSX in .js files. DEPRECATED: Will be removed in @dhis2/cli-app-scripts v13. Consider using the migration script `d2-app-scripts migrate js-to-jsx` to avoid needing this option',
        },
    },
    handler,
}

module.exports = command
