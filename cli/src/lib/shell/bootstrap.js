const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const { reporter, exec } = require('@dhis2/cli-helpers-engine')

const bootstrapShell = async (paths, { shell, force = false } = {}) => {
    const source = shell ? path.resolve(shell) : paths.shellSource,
        dest = paths.shell

    if (fs.pathExistsSync(dest)) {
        if (!shell && !force) {
            reporter.print(
                chalk.dim(
                    `A local appShell exists, skipping bootstrap. ${chalk.bold(
                        'Use --force to update.'
                    )}`
                )
            )
            return dest
        }
        reporter.print(chalk.dim('Removing existing directory'))
        await fs.remove(dest)
    }

    reporter.debug(`Bootstrapping appShell from ${source} to ${dest}`)
    await fs.ensureDir(dest)

    reporter.print(chalk.dim('Copying appShell to temporary directory...'))

    await fs.copy(source, dest, {
        dereference: true,
        filter: src =>
            src.indexOf('node_modules', source.length) === -1 &&
            src.indexOf('.pnp', source.length) === -1 &&
            src.indexOf(paths.shellAppDirname) === -1,
    })

    reporter.print(chalk.dim('Installing dependencies...'))

    await exec({
        cmd: 'yarn',
        args: ['install', '--frozen-lockfile', '--prefer-offline'],
        cwd: dest,
    })
}

module.exports = bootstrapShell
