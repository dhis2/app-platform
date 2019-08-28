const { reporter } = require('@dhis2/cli-helpers-engine')

const fs = require('fs-extra')
const path = require('path')

const makePaths = require('../lib/paths')
const makeShell = require('../lib/shell')
const parseConfig = require('../lib/parseConfig')
const exitOnCatch = require('../lib/exitOnCatch')

const { runCLI } = require('jest-cli')

const handler = async ({ cwd, force, shell: shellSource }) => {
    process.env.BABEL_ENV = 'test'
    process.env.NODE_ENV = 'test'

    const paths = makePaths(cwd)
    const config = parseConfig(paths)
    const shell = makeShell({ config, paths })

    await shell.bootstrap({ force, shell: shellSource })

    reporter.info('Running tests...')

    await exitOnCatch(
        async () => {
            const defaultJestConfig = require(paths.jestConfigDefaults)
            const appJestConfig = fs.existsSync(paths.jestConfig)
                ? require(paths.jestConfig)
                : {}

            const jestConfig = {
                roots: ['./src'],
                ...defaultJestConfig,
                ...appJestConfig,
            }

            const result = await runCLI(jestConfig, [paths.base])

            if (result.results.success) {
                reporter.info(`Tests completed`)
            } else {
                reporter.error(`Tests failed`)
                process.exit(1)
            }
        },
        {
            name: 'test',
            onError: () =>
                reporter.error('Test script exited with non-zero exit code'),
        }
    )
}

const command = {
    command: 'test',
    aliases: 't',
    desc: 'Run application unit tests',
    handler,
}

module.exports = command
