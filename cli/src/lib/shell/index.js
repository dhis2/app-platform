const bootstrap = require('./bootstrap')
const getEnv = require('./env')
const execShellYarn = require('./execShellYarn')

module.exports = ({ config, paths }) => ({
    bootstrap: async (args = {}) => {
        await bootstrap(paths, args)
    },
    // link: async srcPath => {
    //   reporter.info('Linking app into appShell');
    //   await fs.symlink(srcPath, paths.shellApp);
    // },
    build: async () => {
        await execShellYarn(paths, {
            args: 'run build',
            env: getEnv({ name: config.title }),
            pipe: false,
        })
    },
    start: async ({ port }) => {
        await execShellYarn(paths, {
            args: ['run', 'start'],
            env: getEnv({ name: config.title, port }),
            pipe: false,
        })
    },
    test: async () => {
        await execShellYarn(paths, {
            args: ['run', 'test', '--', '--all'],
            env: getEnv({ name: config.title }),
            pipe: true,
        })
    },
})
