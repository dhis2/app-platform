const { exec } = require('@dhis2/cli-helpers-engine')
const formatAppAuthName = require('../formatAppAuthName')
const { getPWAEnvVars } = require('../pwa')
const bootstrap = require('./bootstrap')
const getEnv = require('./env')

module.exports = ({ config, paths }) => {
    const baseEnvVars = {
        name: config.title,
        version: config.version,
        auth_name: formatAppAuthName(config),
    }

    return {
        bootstrap: async (args = {}) => {
            await bootstrap(paths, args)
        },

        build: async () => {
            await exec({
                cmd: 'yarn',
                args: ['run', 'build'],
                cwd: paths.shell,
                env: getEnv({ ...baseEnvVars, ...getPWAEnvVars(config) }),
                pipe: false,
            })
        },
        start: async ({ port }) => {
            await exec({
                cmd: 'yarn',
                args: ['run', 'start'],
                cwd: paths.shell,
                env: getEnv({ ...baseEnvVars, port, ...getPWAEnvVars(config) }),
                pipe: false,
            })
        },
        test: async () => {
            await exec({
                cmd: 'yarn',
                args: ['run', 'test', '--', '--all'],
                cwd: paths.shell,
                env: getEnv({ ...baseEnvVars }),
                pipe: true,
            })
        },
    }
}
