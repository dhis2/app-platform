const fs = require('fs-extra')
const path = require('path')
const { reporter, chalk, exec } = require('@dhis2/cli-helpers-engine')

const scriptsVersion = require(path.join(__dirname, '../../../package.json'))
    .version

const getShellVersion = metaFile => {
    if (fs.existsSync(metaFile)) {
        try {
            const meta = require(metaFile)
            return meta.version
        } catch (e) {
            reporter.debug('Failed to load meta file', e)
            // ignore
        }
    }
    return '0'
}

const bootstrapShell = async (paths, { shell, force = false } = {}) => {
    const source = shell ? path.resolve(shell) : paths.shellSource,
        dest = paths.shell,
        metaFile = path.join(paths.d2, 'meta.json')

    if (fs.pathExistsSync(dest)) {
        const versionMismatch = getShellVersion(metaFile) !== scriptsVersion
        if (versionMismatch) {
            reporter.print(
                chalk.dim(
                    chalk.yellow(
                        'Local shell version does not match scripts version'
                    )
                )
            )
        }

        if (!shell && !force && !versionMismatch) {
            reporter.print(
                chalk.dim(
                    `A local appShell exists, skipping bootstrap. ${chalk.bold(
                        'Use --force to update.'
                    )}`
                )
            )
            return dest
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

    await fs.writeJSONSync(metaFile, {
        version: scriptsVersion,
    })

    reporter.print(chalk.dim('Installing dependencies...'))

    await exec({
        cmd: 'yarn',
        args: ['install', '--frozen-lockfile', '--prefer-offline'],
        cwd: dest,
    })
}

module.exports = bootstrapShell
