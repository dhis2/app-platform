// const { exec } = require('@dhis2/cli-helpers-engine')
const { getPWAEnvVars } = require('../pwa')
const bootstrap = require('./bootstrap')
const getEnv = require('./env')

module.exports = ({ config, paths }) => {
    const baseEnvVars = {
        name: config.title,
        version: config.version,
    }

    // Only add vars if they're `true` or defined to minimize env vars
    if (config.type === 'login_app') {
        baseEnvVars.loginApp = true
    }
    if (config.direction) {
        baseEnvVars.direction = config.direction
    }

    return {
        bootstrap: async (args = {}) => {
            await bootstrap(paths, args)
        },
        env: getEnv({ ...baseEnvVars, ...getPWAEnvVars(config) }),

        // build: async () => {
        //     await exec({
        //         cmd: 'yarn',
        //         args: ['build'],
        //         cwd: paths.shell,
        //         env: getEnv({ ...baseEnvVars, ...getPWAEnvVars(config) }),
        //         pipe: false,
        //     })
        // },
        // start: async ({ port }) => {
        //     await exec({
        //         cmd: 'yarn',
        //         args: [
        //             'start',
        //             '-c',
        //             require.resolve('../../../config/vite.config.mjs'),
        //         ],
        //         cwd: paths.shell,
        //         env: getEnv({ ...baseEnvVars, port, ...getPWAEnvVars(config) }),
        //         // this option allows the colorful and interactive output from Vite:
        //         stdio: 'inherit',
        //     })
        // },
        // // TODO: remove? Test command does not seem to call this method
        // test: async () => {
        //     await exec({
        //         cmd: 'yarn',
        //         args: ['run', 'test', '--', '--all'],
        //         cwd: paths.shell,
        //         env: getEnv({ ...baseEnvVars }),
        //         pipe: true,
        //     })
        // },
    }
}
