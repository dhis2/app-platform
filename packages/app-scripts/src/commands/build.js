const { reporter } = require('@dhis2/cli-helpers-engine')

const fs = require('fs-extra')
const chalk = require('chalk')

const i18n = require('../lib/i18n')
const compile = require('../lib/compile')
const makePaths = require('../lib/paths')
const makeShell = require('../lib/shell')
const parseConfig = require('../lib/parseConfig')
const exitOnCatch = require('../lib/exitOnCatch')

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

const handler = async ({
    cwd,
    mode,
    dev,
    watch,
    shell: shellSource,
    force,
}) => {
    mode = mode || (dev && 'development') || getNodeEnv() || 'production'

    reporter.info(`Build mode: ${chalk.bold(mode)}`)
    const paths = makePaths(cwd)
    const config = parseConfig(paths)
    const shell = makeShell({ config, paths })

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
                await shell.bootstrap({ shell: shellSource, force })
            }

            reporter.info('Building app...')
            await compile({
                config,
                paths,
                mode,
                watch,
            })
            reporter.info(` - Built in mode ${chalk.bold(mode)}`)

            if (config.type === 'app') {
                reporter.info('Building appShell...')
                await shell.build()
                reporter.info(` - Built in mode ${chalk.bold(mode)}`)
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

        if (fs.pathExistsSync(paths.buildOutput)) {
            await fs.remove(paths.buildOutput)
        }
        await fs.copy(paths.shellBuildOutput, paths.buildOutput)
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
