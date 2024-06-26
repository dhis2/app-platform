const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const { isApp } = require('../parseConfig')

// todo: could this be moved to parseConfig?
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
    if (isApp(config.type)) {
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

    const verifyLibraryEntrypoint = (entrypoint) => {
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

/**
 * Reads the default entrypoint wrapper file (shell/src/App.jsx) as a string,
 * updates it to import from the user's configured entrypoint,
 * then returns the string of the updated file contents
 */
const getEntrypointWrapper = async ({ entrypoint, paths }) => {
    const relativeEntrypoint = entrypoint.replace(/^(\.\/)?src\//, '')
    const shellAppSource = await fs.readFile(paths.shellSourceEntrypoint)

    return shellAppSource
        .toString()
        .replace(
            '() => <div id="dhis2-placeholder" />',
            `React.lazy(() => import('./D2App/${relativeEntrypoint}'))`
        )
}

exports.createAppEntrypointWrapper = async ({ entrypoint, paths }) => {
    await fs.writeFile(
        paths.shellAppEntrypoint,
        await getEntrypointWrapper({ entrypoint, paths })
    )
}

exports.createPluginEntrypointWrapper = async ({ entrypoint, paths }) => {
    // todo: could inject `import.meta.env.DHIS2_APP_PLUGIN` env var here
    // (currently it's not in env since it's shared with the app)
    await fs.writeFile(
        paths.shellPluginEntrypoint,
        await getEntrypointWrapper({ entrypoint, paths })
    )
}
