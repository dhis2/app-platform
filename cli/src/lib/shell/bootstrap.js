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

const resolveShellOverride = (paths, shell) => {
    reporter.print(chalk.dim(`Using custom shell source ${shell}`))
    if (shell.startsWith('/') || shell.startsWith('.') || /^[A-Z]:/.test(shell)) {
        // This is a local filesystem path
        const absoluteShell = path.resolve(paths.base, shell)
        if (!fs.existsSync(absoluteShell) || !fs.statSync(absoluteShell).isDirectory()) {
            reporter.error(`Custom shell source ${absoluteShell} does not exist or is not a directory`)
            process.exit(1)
        }
        return absoluteShell
    }
    try {
        return path.dirname(require.resolve(`${shell}/package.json`))
    } catch {
        reporter.error(`Could not resolve custom shell pacakge ${shell} - make sure it has already been installed`)
        process.exit(1)
    }
}

const updateShell = async (paths, { shell }) => {
    const source = shell ? resolveShellOverride(paths, shell) : paths.shellSource,
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

const resolveOverride = (paths, override) => {
    // Update relative filesystem package resolutions
    if (/^(file|link|portal):\./.test(override)) {
        const pathIndex = override.indexOf(':') + 1
        const protocol = override.substring(0, pathIndex)

        const resolvedPath = path.relative(paths.shell, path.resolve(paths.base, override.substring(pathIndex)))
        reporter.debug(`Resolved relative override location to ${resolvedPath}`)
        return `${protocol}${resolvedPath}`
    }
    return override
}

const overrideAdapter = async (paths, { adapter }) => {
    if (!adapter) {
        return
    }

    reporter.debug(`Installing custom adapter package ${adapter}`)
    const adapterResolution = resolveOverride(paths, adapter)

    try {
        await exec({
            cmd: 'yarn',
            args: ['add', `@dhis2/app-adapter@${adapterResolution}`],
            cwd: paths.shell,
        })
    } catch (e) {
        reporter.error(`Couldn't resolve custom adapter package ${adapter} with ${chalk.bold('yarn add')}`)
        process.exit(1)
    }
}

const bootstrapShell = async (paths, opts = {}) => {
    const updateRequired = shellRequiresUpdate(paths, opts)
    if (updateRequired) {
        await updateShell(paths, opts)
    }

    reporter.print(
        chalk.dim(
            `${updateRequired ? 'Installing' : 'Updating'
            } appShell dependencies...`
        )
    )

    await overrideAdapter(paths, opts)
    await exec({
        cmd: 'yarn',
        args: ['install'],
        cwd: paths.shell,
    })
}
module.exports = bootstrapShell
