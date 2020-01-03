const fs = require('fs-extra')
const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')

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

const bootstrapShell = async (paths, { shell, force = false } = {}) => {
    const source = shell ? path.resolve(shell) : paths.shellSource,
        dest = paths.shell

    if (fs.pathExistsSync(dest)) {
        if (!shell) {
            const versionMismatch =
                getShellVersion(dest) !== currentShellVersion
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
                return dest
            }
        }

        reporter.print(chalk.dim('Removing existing directory...'))
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

    const srcNodeModules = path.join(source, 'node_modules')
    const destNodeModules = path.join(dest, 'node_modules')
    if (fs.exists(srcNodeModules)) {
        reporter.debug(
            `Linking ${path.relative(
                paths.base,
                destNodeModules
            )} to ${path.relative(paths.base, srcNodeModules)}...`
        )
        await fs.ensureSymlink(srcNodeModules, destNodeModules)
    }
}

module.exports = bootstrapShell
