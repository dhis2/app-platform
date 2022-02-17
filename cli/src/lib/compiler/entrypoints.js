const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const { normalizeExtension } = require('./extensionHelpers.js')

const verifyEntrypoint = ({ entrypoint, basePath, resolveModule }) => {
    if (!entrypoint.match(/^(\.\/)?src\//)) {
        const msg = `Entrypoint ${chalk.bold(
            entrypoint
        )} must be located within the ${chalk.bold('./src')} directory`
        reporter.error(msg)
        throw new Error(msg)
    }

    try {
        resolveModule(path.join(basePath, entrypoint))
    } catch (e) {
        const msg = `Could not resolve entrypoint ${chalk.bold(entrypoint)}`
        reporter.error(msg)
        throw new Error(msg)
    }
}

exports.verifyEntrypoints = ({
    config,
    paths,
    resolveModule = require.resolve,
}) => {
    if (config.type === 'app') {
        if (
            !config.entryPoints ||
            (!config.entryPoints.app && !config.entryPoints.plugin)
        ) {
            throw new Error('Apps must define an app or plugin entrypoint')
        }

        if (config.entryPoints.app) {
            verifyEntrypoint({
                entrypoint: config.entryPoints.app,
                basePath: paths.base,
                resolveModule,
            })
        }
        if (config.entryPoints.plugin) {
            verifyEntrypoint({
                entrypoint: config.entryPoints.plugin,
                basePath: paths.base,
                resolveModule,
            })
        }
        return
    }

    if (!config.entryPoints || !config.entryPoints.lib) {
        throw new Error('Libraries must define a lib entrypoint')
    }

    const verifyLibraryEntrypoint = entrypoint => {
        switch (typeof entrypoint) {
            case 'string':
                verifyEntrypoint({
                    entrypoint,
                    basePath: paths.base,
                    resolveModule,
                })
                return
            case 'object':
                Object.values(entrypoint).forEach(verifyLibraryEntrypoint)
                return
            default: {
                const msg = `${chalk.bold(
                    entrypoint
                )} is not a valid entrypoint`
                reporter.error(msg)
                throw new Error(msg)
            }
        }
    }
    verifyLibraryEntrypoint(config.entryPoints.lib)
}

exports.overwriteAppEntrypoint = async ({ entrypoint, paths }) => {
    const relativeEntrypoint = entrypoint.replace(/^(\.\/)?src\//, '')
    const outRelativeEntrypoint = normalizeExtension(relativeEntrypoint)
    const shellAppSource = await fs.readFile(paths.shellSourceEntrypoint)
    await fs.writeFile(
        paths.shellAppEntrypoint,
        shellAppSource
            .toString()
            .replace(/'.\/D2App\/app'/g, `'./D2App/${outRelativeEntrypoint}'`)
    )
}
