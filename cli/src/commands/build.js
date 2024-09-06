const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
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
const { injectPrecacheManifest, compileServiceWorker } = require('../lib/pwa')
const { validatePackage } = require('../lib/validatePackage')
const { handler: pack } = require('./pack.js')

const buildModes = ['development', 'production']

const getNodeEnv = () => {
    let nodeEnv = process.env['NODE_ENV']
    if (nodeEnv) {
        nodeEnv = nodeEnv.toLowerCase()
        if (buildModes.includes(nodeEnv)) {
            return nodeEnv
        }
    }
    return null
}

const printBuildParam = (key, value) => {
    reporter.print(chalk.green(` - ${key} :`), chalk.yellow(value))
}
const getAppParameters = (standalone, config) => {
    const publicUrl = process.env.PUBLIC_URL || '.'
    printBuildParam('PUBLIC_URL', publicUrl)

    if (
        standalone === false ||
        (typeof standalone === 'undefined' && !config.standalone)
    ) {
        const defaultBase = config.coreApp ? `..` : `../../..`
        const baseUrl = process.env.DHIS2_BASE_URL || defaultBase

        printBuildParam('DHIS2_BASE_URL', baseUrl)
        return { publicUrl, baseUrl }
    } else {
        printBuildParam('DHIS2_BASE_URL', '<standalone>')
        return { publicUrl }
    }
}

const handler = async ({
    cwd = process.cwd(),
    mode,
    dev,
    watch,
    standalone,
    shell: shellSource,
    verify,
    force,
    pack: packAppOutput,
    allowJsxInJs,
}) => {
    const paths = makePaths(cwd)

    mode = mode || (dev && 'development') || getNodeEnv() || 'production'
    process.env.BABEL_ENV = process.env.NODE_ENV = mode
    loadEnvFiles(paths, mode)

    reporter.print(chalk.green.bold('Build parameters:'))
    printBuildParam('Mode', mode)

    const config = parseConfig(paths)
    const appParameters = isApp(config.type)
        ? getAppParameters(standalone, config)
        : null

    await fs.remove(paths.buildOutput)

    await exitOnCatch(
        async () => {
            if (
                !(await validatePackage({
                    config,
                    paths,
                    offerFix: !process.env.CI,
                    noVerify: !verify,
                }))
            ) {
                reporter.error(
                    'Failed to validate package, use --no-verify to skip these checks'
                )
                process.exit(1)
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

            if (isApp(config.type)) {
                reporter.info('Bootstrapping local appShell...')
                await bootstrapShell({ paths, shell: shellSource, force })
            }

            reporter.info(
                `Building ${config.type} ${chalk.bold(config.name)}...`
            )

            if (isApp(config.type)) {
                await compile({
                    config,
                    paths,
                    mode,
                    watch,
                })

                // Manifest generation moved here so these static assets can be
                // precached by Workbox during the shell build step
                reporter.info('Generating manifests...')
                await generateManifests(paths, config, process.env.PUBLIC_URL)

                reporter.info('Building appShell...')
                // These imports are done asynchronously to allow Vite to use its
                // ESM build of its Node API (the CJS build will be removed in v6)
                // https://vitejs.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated
                const { build } = await import('vite')
                const { default: createConfig } = await import(
                    '../../config/makeViteConfig.mjs'
                )
                const env = getEnv({ config, ...appParameters })
                const viteConfig = createConfig({
                    paths,
                    config,
                    env,
                    allowJsxInJs,
                })
                await build(viteConfig)

                if (config.pwa.enabled) {
                    reporter.info('Compiling service worker...')
                    await compileServiceWorker({ env, paths, mode })

                    reporter.info(
                        'Injecting supplementary precache manifest...'
                    )
                    await injectPrecacheManifest(paths, config)
                }
            } else {
                await Promise.all([
                    compile({
                        config,
                        paths,
                        moduleType: 'es',
                        mode,
                        watch,
                    }),
                    compile({
                        config,
                        paths,
                        moduleType: 'cjs',
                        mode,
                        watch,
                    }),
                ])
            }
        },
        {
            name: 'build',
            onError: (err) => {
                reporter.error(err)
                reporter.error('Build script failed')
            },
        }
    )

    if (isApp(config.type)) {
        if (!fs.pathExistsSync(paths.shellBuildOutput)) {
            reporter.error('No build output found')
            process.exit(1)
        }

        await fs.copy(paths.shellBuildOutput, paths.buildAppOutput)

        if (packAppOutput) {
            const bundle = path.parse(paths.buildAppBundle)

            await fs.remove(paths.buildAppBundleOutput)
            // update bundle archive
            await pack({
                destination: path.resolve(cwd, bundle.dir),
                filename: bundle.base,
            })
        }

        reporter.print(chalk.green('\n**** DONE! ****'))
    }
}

const command = {
    aliases: 'b',
    desc: 'Build a production app bundle for use with the DHIS2 app-shell',
    builder: {
        mode: {
            description: 'Specify the target build environment',
            aliases: 'm',
            choices: buildModes,
            defaultDescription: 'production',
        },
        dev: {
            type: 'boolean',
            description: 'Build in development mode',
            conflicts: 'mode',
        },
        verify: {
            type: 'boolean',
            description: 'Validate package before building',
            default: true,
        },
        watch: {
            type: 'boolean',
            description: 'Watch source files for changes',
            default: false,
        },
        pack: {
            type: 'boolean',
            description: 'Create a .zip archive of the built application',
            default: true,
        },
        standalone: {
            type: 'boolean',
            description:
                'Build in standalone mode (overrides the d2.config.js setting)',
            default: undefined,
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
