const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const { compile } = require('../lib/compiler')
const exitOnCatch = require('../lib/exitOnCatch')
const generateManifests = require('../lib/generateManifests')
const i18n = require('../lib/i18n')
const loadEnvFiles = require('../lib/loadEnvFiles')
const parseConfig = require('../lib/parseConfig')
const makePaths = require('../lib/paths')
const { injectPrecacheManifest } = require('../lib/pwa')
const makeShell = require('../lib/shell')
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
const setAppParameters = (standalone, config) => {
    process.env.PUBLIC_URL = process.env.PUBLIC_URL || '.'
    printBuildParam('PUBLIC_URL', process.env.PUBLIC_URL)

    if (
        standalone === false ||
        (typeof standalone === 'undefined' && !config.standalone)
    ) {
        const defaultBase = config.coreApp ? `..` : `../../..`
        process.env.DHIS2_BASE_URL = process.env.DHIS2_BASE_URL || defaultBase

        printBuildParam('DHIS2_BASE_URL', process.env.DHIS2_BASE_URL)
    } else {
        printBuildParam('DHIS2_BASE_URL', '<standalone>')
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
}) => {
    const paths = makePaths(cwd)

    mode = mode || (dev && 'development') || getNodeEnv() || 'production'
    loadEnvFiles(paths, mode)

    reporter.print(chalk.green.bold('Build parameters:'))
    printBuildParam('Mode', mode)

    const config = parseConfig(paths)
    const shell = makeShell({ config, paths })

    if (config.type === 'app') {
        setAppParameters(standalone, config)
    }

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

            if (config.type === 'app') {
                reporter.info('Bootstrapping local appShell...')
                await shell.bootstrap({ shell: shellSource, force })
            }

            reporter.info(
                `Building ${config.type} ${chalk.bold(config.name)}...`
            )

            if (config.type === 'app') {
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

                // CRA Manages service worker compilation here
                reporter.info('Building appShell...')
                await shell.build()

                if (config.pwa.enabled) {
                    reporter.info('Injecting precache manifest...')
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
            onError: () => reporter.error('Build script failed'),
        }
    )

    if (config.type === 'app') {
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
    },
    handler,
}

module.exports = command
