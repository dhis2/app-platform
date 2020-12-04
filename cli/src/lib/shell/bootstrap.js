const fs = require('fs-extra')
const path = require('path')
const { reporter, chalk, exec } = require('@dhis2/cli-helpers-engine')

const currentShellVersion = require('@dhis2/app-shell/package.json').version

const getShellVersion = shellDir => {
    const shellPkg = path.join(shellDir, 'package.json')
    if (fs.existsSync(shellPkg)) {
        try {
            const pkg = require(shellPkg)
            return pkg.version
        } catch (e) {
            reporter.debug('Failed to load shell package.json file', e)
            // ignore
        }
    }
    return '0'
}

const shellRequiresUpdate = (paths, { shell, force = false }) => {
    const shellDir = paths.shell
    if (fs.pathExistsSync(shellDir) && !shell) {
        const versionMismatch =
            getShellVersion(shellDir) !== currentShellVersion

        if (versionMismatch) {
            reporter.print(
                chalk.dim(
                    chalk.yellow(
                        'Local shell version does not match scripts version'
                    )
                )
            )
        }

        if (!force && !versionMismatch) {
            reporter.print(
                chalk.dim(
                    `A local appShell exists, skipping bootstrap. ${chalk.bold(
                        'Use --force to update.'
                    )}`
                )
            )
            return false
        }
    }
    return true
}

const updateShell = async (paths, { shell }) => {
    const source = shell ? path.resolve(shell) : paths.shellSource,
        dest = paths.shell

    reporter.print(chalk.dim('Removing existing directory...'))
    await fs.remove(dest)

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

    // Touch the lock file so that the directory is recognized as a package root
    const yarnLockFile = path.join(dest, 'yarn.lock')
    const handle = await fs.open(yarnLockFile, 'w')
    await fs.close(handle)

    await exec({
        cmd: 'yarn',
        args: ['add', `D2App@portal:${paths.base}`],
        cwd: dest,
    })
}

const bootstrapShell = async (paths, opts = {}) => {
    const updateRequired = shellRequiresUpdate(paths, opts)
    if (updateRequired) {
        await updateShell(paths, opts)
    }

    reporter.print(
        chalk.dim(
            `${
                updateRequired ? 'Installing' : 'Updating'
            } appShell dependencies...`
        )
    )
    await exec({
        cmd: 'yarn',
        args: ['install'],
        cwd: paths.shell,
    })
}
module.exports = bootstrapShell
