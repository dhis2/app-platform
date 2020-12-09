const path = require('path')
const { exec } = require('@dhis2/cli-helpers-engine')

const execShellYarn = async (paths, { args, ...opts }) => {
    const yarnCmd = path.join(paths.shell, '.yarn/releases/yarn-2.4.0.cjs')
    let argsArray = args
    if (typeof args === 'string') {
        argsArray = args.split(' ')
    } else if (!Array.isArray(args)) {
        throw new Error(
            'execShellYarn args must be either an array or a string'
        )
    }

    await exec({
        cmd: yarnCmd,
        args: argsArray,
        cwd: paths.shell,
        ...opts,
    })
}

module.exports = execShellYarn
