const { exec } = require('@dhis2/cli-helpers-engine')
const { getPWAEnvVars } = require('../pwa')
const bootstrap = require('./bootstrap')
const getEnv = require('./env')

module.exports = ({ config, paths }) => {
    const baseEnvVars = {
        name: config.title,
        version: config.version,
    }

    if (config.direction) {
        baseEnvVars.direction = config.direction
    }

    return {
        bootstrap: async (args = {}) => {
            await bootstrap(paths, args)
        },

        build: async () => {
            await exec({
                cmd: 'yarn',
                args: ['build'],
                cwd: paths.shell,
                env: getEnv({ ...baseEnvVars, ...getPWAEnvVars(config) }),
                pipe: false,
            })
        },
        start: async ({ port }) => {
            await exec({
                cmd: 'yarn',
                args: ['start:vite'],
                cwd: paths.shell,
                env: getEnv({ ...baseEnvVars, port, ...getPWAEnvVars(config) }),
                pipe: false,
            })
        },
        // TODO: remove? Test command does not seem to call this method
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
