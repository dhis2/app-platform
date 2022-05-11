const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const { compile } = require('../lib/compiler')
const exitOnCatch = require('../lib/exitOnCatch')
const generateManifests = require('../lib/generateManifests')
const i18n = require('../lib/i18n/index.js')
const {
    buildModes,
    determineBuildMode,
    exitWhenPackageInvalid,
    printBuildParam,
    setAppParameters,
} = require('../lib/index.js')
const loadEnvFiles = require('../lib/loadEnvFiles')
const parseConfig = require('../lib/parseConfig')
const makePaths = require('../lib/paths')
const { craBuild } = require('../lib/shell')
const { handler: pack } = require('./pack.js')

const handler = ({
    cwd = process.cwd(),
    mode: modeArg,
    dev,
    watch,
    standalone,
    verify,
    pack: packAppOutput,
    verbose,
}) =>
    exitOnCatch(
        async () => {
            const paths = makePaths(cwd)
            const mode = determineBuildMode(modeArg, dev)

            loadEnvFiles(paths, mode)

            reporter.print(chalk.green.bold('Build parameters:'))
            printBuildParam('Mode', mode)

            const config = parseConfig(paths)

            if (config.type === 'app') {
                setAppParameters(standalone, config)
            }

            await fs.remove(paths.buildOutput)
            await exitWhenPackageInvalid(config, paths, verify)

            reporter.info('Generating internationalization strings...')
            await i18n.extractAndGenerate(paths)

            reporter.info(
                `Building ${config.type} ${chalk.bold(config.name)}...`
            )

            if (config.type === 'app') {
                // Manifest generation moved here so these static assets can be
                // precached by Workbox during the shell build step
                reporter.info('Generating manifests...')
                await generateManifests(paths, config, process.env.PUBLIC_URL)

                // @TODO: Figure out how to do this
                // const { injectPrecacheManifest } = require('../lib/pwa')
                // if (config.pwa.enabled) {
                //     reporter.info('Injecting precache manifest...')
                //     await injectPrecacheManifest(paths, config)
                // }

                reporter.info('Ensuring that a build folder exists')
                fs.ensureDirSync(paths.buildOutput)

                // CRA Manages service worker compilation here
                reporter.info('Creating a production build...')
                await craBuild({ config, verbose, cwd })

                if (!fs.pathExistsSync(paths.buildAppOutput)) {
                    reporter.error('No build output found')
                    process.exit(1)
                }

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
