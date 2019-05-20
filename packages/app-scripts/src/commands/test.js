const { reporter } = require('@dhis2/cli-helpers-engine')

const i18n = require('../lib/i18n')
const compile = require('../lib/compile')
const makePaths = require('../lib/paths')
const makeShell = require('../lib/shell')
const exitOnCatch = require('../lib/exitOnCatch')

const handler = async ({ cwd, force, shell: shellSource }) => {
    const paths = makePaths(cwd)

    const shell = makeShell(paths)
    await shell.bootstrap({ force, shell: shellSource })

    reporter.info('Running tests...')

    await exitOnCatch(
        async () => {
            const compilePromise = compile({
                mode: 'development',
                paths,
                watch: false,
            })
            const testPromise = shell.test()
            await Promise.all([compilePromise, testPromise])
        },
        {
            name: 'start',
            onError: () =>
                reporter.error('Start script exited with non-zero exit code'),
        }
    )
}

const command = {
    command: 'test',
    aliases: 't',
    desc: 'Run app-shell and application tests',
    handler,
}

module.exports = command
