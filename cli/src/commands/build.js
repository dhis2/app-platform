const { reporter, chalk } = require('@dhis2/cli-helpers-engine')

const fs = require('fs-extra')
const path = require('path')

const i18n = require('../lib/i18n')
const { compile } = require('../lib/compiler')
const makePaths = require('../lib/paths')
const makeShell = require('../lib/shell')
const parseConfig = require('../lib/parseConfig')
const exitOnCatch = require('../lib/exitOnCatch')
const generateManifest = require('../lib/generateManifest')
const bundleApp = require('../lib/bundleApp')
const loadEnvFiles = require('../lib/loadEnvFiles')
const validateAppPackage = require('../lib/validateAppPackage')

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
    adapter,
    force,
}) => {
    const paths = makePaths(cwd)

    mode = mode || (dev && 'development') || getNodeEnv() || 'production'
    loadEnvFiles(paths, mode)

    reporter.print(chalk.green.bold('Build parameters:'))
    printBuildParam('Mode', mode)

    const config = parseConfig(paths)
    const shell = makeShell({ config, paths })

    if (!(await validateAppPackage(config, paths))) {
        process.exit(1)
    }

    if (config.type === 'app') {
        setAppParameters(standalone, config)
    }

    await fs.remove(paths.buildOutput)

    await exitOnCatch(
        async () => {
            reporter.info('Generating internationalization strings...')
            await i18n.extract({ input: paths.src, output: paths.i18nStrings })
            await i18n.generate({
                input: paths.i18nStrings,
                output: paths.i18nLocales,
                namespace: 'default',
            })

            if (config.type === 'app') {
                reporter.info('Bootstrapping local appShell...')
                await shell.bootstrap({ shell: shellSource, adapter, force })
            }

            reporter.info(
                `Building ${config.type} ${chalk.bold(config.name)}...`
            )
            await compile({
                config,
                paths,
                mode,
                watch,
            })

            if (config.type === 'app') {
                reporter.info('Building appShell...')
                await shell.build()
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
                path.relative(cwd, appBundle)
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
