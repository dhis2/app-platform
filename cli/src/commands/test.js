const { reporter } = require('@dhis2/cli-helpers-engine')
const exitOnCatch = require('../lib/exitOnCatch')
const { craTest } = require('../lib/index.js')
const loadEnvFiles = require('../lib/loadEnvFiles')
const makePaths = require('../lib/paths')

const handler = async ({ cwd }) => {
    const testArgs = process.argv.slice(3)
    const paths = makePaths(cwd)

    const mode = (process.env.NODE_ENV = process.env.BABEL_ENV = 'test')
    loadEnvFiles(paths, mode)

    reporter.info('Running tests...')

    await exitOnCatch(async () => await craTest({ cwd, testArgs }), {
        name: 'test',
        onError: () =>
            reporter.error('Test script exited with non-zero exit code'),
    })
}

const command = {
    command: 'test [testRegex]',
    aliases: 't',
    desc: 'Run application unit tests',
    builder: {
        updateSnapshot: {
            type: 'boolean',
            desc: 'Update jest snapshots',
            aliases: 'u',
            default: false,
        },
        coverage: {
            type: 'boolean',
            desc: 'Collect test coverage',
            default: false,
        },
        watch: {
            type: 'boolean',
            desc: 'Watch modified source files for changes',
            alias: 'w',
            default: false,
        },
        watchAll: {
            type: 'boolean',
            desc: 'Watch all source files for changes',
            default: false,
        },
        jestConfig: {
            desc: 'Path to a jest config file',
        },
    },
    handler,
}

module.exports = command
