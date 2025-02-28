const path = require('path')
const { reporter } = require('@dhis2/cli-helpers-engine')
const { runCLI } = require('@jest/core')
const fs = require('fs-extra')
const { loadEnvFiles } = require('../lib/env')
const exitOnCatch = require('../lib/exitOnCatch')
const makePaths = require('../lib/paths')

const getAppJestConfig = ({ jestConfigPath, paths }) => {
    if (jestConfigPath) {
        return require(path.resolve(paths.base, jestConfigPath))
    } else if (fs.existsSync(paths.jestConfig)) {
        return require(paths.jestConfig)
    } else {
        return {}
    }
}

const handler = async ({
    verbose,
    cwd,
    testRegex,
    updateSnapshot,
    coverage,
    watch,
    watchAll,
    jestConfig: jestConfigPath,
}) => {
    const paths = makePaths(cwd)

    const mode = (process.env.NODE_ENV = process.env.BABEL_ENV = 'test')
    loadEnvFiles(paths, mode)

    reporter.info('Running tests...')

    await exitOnCatch(
        async () => {
            const defaultJestConfig = require(paths.jestConfigDefaults)
            const appJestConfig = getAppJestConfig({
                jestConfigPath,
                paths,
            })
            const pkgJestConfig = require(paths.package).jest

            const jestConfig = {
                roots: ['./src'],
                ...defaultJestConfig,
                ...appJestConfig,
                ...pkgJestConfig,
            }

            reporter.debug('Resolved jest config', jestConfig)

            const ci = process.env.CI

            const result = await runCLI(
                {
                    // This arg actually expects an array
                    // https://github.com/facebook/jest/blob/21a92711a22c7b6633909fd42a87499e179d80c2/packages/jest-config/src/normalize.ts#L391-L417
                    testPathPattern: testRegex && [testRegex],
                    config: JSON.stringify(jestConfig),
                    updateSnapshot: !ci && updateSnapshot,
                    collectCoverage: coverage,
                    watch: (!ci && watch) || undefined,
                    watchAll: (!ci && watchAll) || undefined,
                    ci,
                    verbose: verbose,
                },
                [paths.base]
            )

            if (result.results.success) {
                reporter.info(`Tests completed`)
            } else {
                reporter.error(`Tests failed`)
                process.exit(1)
            }
        },
        {
            name: 'test',
            onError: (e) => {
                reporter.error(e)
                reporter.error('Test script exited with non-zero exit code')
            },
        }
    )
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
