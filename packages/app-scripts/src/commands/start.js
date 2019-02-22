const { reporter } = require('@dhis2/cli-helpers-engine')

const i18n = require('../lib/i18n')
const compile = require('../lib/compile')
const makePaths = require('../lib/paths')
const makeShell = require('../lib/shell')
const exitOnCatch = require('../lib/exitOnCatch')

const handler = async ({ cwd, force }) => {
    const paths = makePaths(cwd)

    const shell = makeShell(paths)
    await shell.bootstrap({ force })

    reporter.info('Starting app shell...')

    exitOnCatch(
        async () => {
            await i18n.extract({ input: paths.src, output: paths.i18nStrings })
            await i18n.generate({
                input: paths.i18nStrings,
                output: paths.i18nLocales,
                namespace: 'default',
            })
            const compilePromise = compile({
                mode: 'development',
                paths,
                watch: true,
            })
            const startPromise = shell.start()
            await Promise.all([compilePromise, startPromise])
            process.exit(1)
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
    desc:
        'Start a development server running a DHIS2 app within the DHIS2 app-shell',
    handler,
}

module.exports = command
