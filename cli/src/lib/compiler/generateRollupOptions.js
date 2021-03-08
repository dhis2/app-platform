const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const {
    bootstrapModuleName,
    runtimeModuleNamespace,
} = require('./bundleHelpers')

module.exports.generateRollupOptions = ({
    d2config: { name, entryPoints, buildOptions },
    outDir,
    mode,
}) => {
    const { modules } = buildOptions
    const globals = {}
    const configs = Object.entries(modules).reduce(
        (inputs, [name, moduleConfig]) => {
            try {
                require.resolve(name, { paths: [process.cwd()] })
            } catch (e) {
                reporter.warn(
                    chalk.dim(`Module ${name} not found, skipping...`)
                )
                return inputs
            }
            if (moduleConfig.type === 'umd') {
                globals[name] = name
            }

            inputs.push({
                input: {
                    [name]:
                        typeof moduleConfig === 'string'
                            ? moduleConfig
                            : moduleConfig.input || name,
                },
                format: moduleConfig.type === 'umd' ? 'umd' : 'system',
            })
            return inputs
        },
        []
    )
    const external = configs.reduce((list, config) => {
        Object.keys(config.input).forEach(inputName => {
            if (name !== inputName) {
                list.push(inputName)
            }
        })
        return list
    }, [])
    configs.push({
        input: Object.entries(entryPoints).reduce(
            (localInputs, [entryName, src]) => {
                if (!['bootstrap', 'lib'].includes(entryName)) {
                    localInputs[
                        `${runtimeModuleNamespace}/${name}/${entryName}`
                    ] = src
                }
                return localInputs
            },
            {}
        ),
        format: 'system',
    })
    configs.push({
        input: { [bootstrapModuleName]: entryPoints.bootstrap },
        format: 'iife',
    })
    return configs.map(config => ({
        input: config.input,
        dir: path.join(outDir, 'static/js'),
        format: config.format,
        environment: {
            MODE: mode,
        },
        globals,
        external: config.format !== 'iife' ? external : undefined,
    }))
}
