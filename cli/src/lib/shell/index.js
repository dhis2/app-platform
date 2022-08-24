const { exec } = require('@dhis2/cli-helpers-engine')
const { getPWAEnvVars } = require('../pwa')
const bootstrap = require('./bootstrap')
const getEnv = require('./env')

module.exports = ({ config, paths }) => ({
    bootstrap: async (args = {}) => {
        await bootstrap(paths, args)
    },
    // link: async srcPath => {
    //   reporter.info('Linking app into appShell');
    //   await fs.symlink(srcPath, paths.shellApp);
    // },
    build: async () => {
        await exec({
            cmd: 'yarn',
            args: ['run', 'build'],
            cwd: paths.shell,
            env: getEnv({ name: config.title, ...getPWAEnvVars(config) }),
            pipe: false,
        })
    },
    start: async ({ port }) => {
        await exec({
            cmd: 'yarn',
            args: ['run', 'start'],
            cwd: paths.shell,
            env: getEnv({ name: config.title, port, ...getPWAEnvVars(config) }),
            pipe: false,
        })
    },
    // TODO: remove? Test command does not seem to call this method
    test: async () => {
        await exec({
            cmd: 'yarn',
            args: ['run', 'test', '--', '--all'],
            cwd: paths.shell,
            env: getEnv({ name: config.title }),
            pipe: true,
        })
    },
})
