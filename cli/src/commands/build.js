const { reporter } = require('@dhis2/cli-helpers-engine')

const fs = require('fs-extra')
const chalk = require('chalk')
const path = require('path')

const i18n = require('../lib/i18n')
const compile = require('../lib/compile')
const makePaths = require('../lib/paths')
const makeShell = require('../lib/shell')
const parseConfig = require('../lib/parseConfig')
const exitOnCatch = require('../lib/exitOnCatch')
const generateManifest = require('../lib/generateManifest')
const bundleApp = require('../lib/bundleApp')
const loadEnvFiles = require('../lib/loadEnvFiles')

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

// This is nasty and frankly wrong (also don't use long unweildy capitalized names in a URL!) but has to match the current DHIS2 app server
// From https://github.com/dhis2/dhis2-core/blob/master/dhis-2/dhis-api/src/main/java/org/hisp/dhis/appmanager/App.java#L360-L371
const getUrlFriendlyName = name =>
    name
        .trim()
        .replace(/[^A-Za-z0-9\s-]/g, '')
        .replace(/ /g, '-')

const handler = async ({
    cwd,
    mode,
    dev,
    watch,
    shell: shellSource,
    force,
}) => {
    const paths = makePaths(cwd)

    mode = mode || (dev && 'development') || getNodeEnv() || 'production'
    loadEnvFiles(paths, mode)

    reporter.info(`Build mode: ${chalk.bold(mode)}`)
    const config = parseConfig(paths)
    const shell = makeShell({ config, paths })

    process.env.PUBLIC_URL = process.env.PUBLIC_URL || '.'
    if (!config.standalone) {
        process.env.DHIS2_BASE_URL =
            process.env.DHIS2_BASE_URL || config.coreApp ? `..` : `../../..`
    }

    await fs.remove(paths.buildOutput)

    await exitOnCatch(
        async () => {
            reporter.info('Generating internationalization strings...')
            await i18n.extract({ input: paths.src, output: paths.i18nStrings })
            await i18n.generate({
                input: paths.i18nStrings,
                output: paths.i18nLocales,
                namespace: config.name || 'default',
            })

            if (config.type === 'app') {
                reporter.info('Bootstrapping local appShell...')
                await shell.bootstrap({ shell: shellSource, force })
            }

            reporter.info(`Building app ${chalk.bold(config.name)}...`)
            await compile({
                config,
                paths,
                mode,
                watch,
            })
            reporter.info(chalk.dim(` - Built in mode ${chalk.bold(mode)}`))

            if (config.type === 'app') {
                reporter.info('Building appShell...')
                await shell.build()
                reporter.info(chalk.dim(` - Built in mode ${chalk.bold(mode)}`))
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

        reporter.info('Generating manifest...')
        await generateManifest(paths, config, process.env.PUBLIC_URL)

        const appBundle = paths.buildAppBundle
            .replace(/{{name}}/, config.name)
            .replace(/{{version}}/, config.version)
        reporter.info(
            `Creating app archive at ${chalk.bold(
                path.relative(process.cwd(), appBundle)
            )}...`
        )
        await bundleApp(paths.buildAppOutput, appBundle)

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
        watch: {
            type: 'boolean',
            description: 'Watch source files for changes',
            default: false,
        },
    },
    handler,
}

module.exports = command
