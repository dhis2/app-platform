const path = require('path')
const { configFactory: rollupConfigFactory } = require('@dhis2/config-rollup')
const fs = require('fs-extra')
const { rollup } = require('rollup')

console.log(rollupConfigFactory)

const runtimeModuleNamespace = '$dhis2'

const prepareOptions = ({
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
                console.log(`Module ${name} not found, skipping...`)
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
                localInputs[
                    `${runtimeModuleNamespace}/${name}/${entryName}`
                ] = src
                return localInputs
            },
            {}
        ),
        format: 'system',
    })
    return configs.map(config => ({
        input: config.input,
        dir: path.join(outDir, 'static/js'),
        format: config.format,
        environment: {
            MODE: mode,
            IMPORT_MAP_PATH: path.resolve(outDir, `import-map.${mode}.json`),
        },
        globals,
        external,
    }))
}

const bundle = async ({ d2config, outDir, mode, publicDir, watch }) => {
    if (watch) {
        console.error('Watch mode is currently unimplemented')
        process.exit(1)
    }

    const configs = prepareOptions({
        d2config,
        outDir,
        mode,
    })

    const importMap = {
        imports: {},
    }

    const warnings = []
    warnings.flush = () => {
        while (warnings.length) {
            console.warn('WARNING', warnings.shift().toString())
        }
    }
    const bundlers = configs.map(config => ({
        name: Object.keys(config.input).join(', '),
        config,
        run: async () => {
            const options = rollupConfigFactory({ ...config })
            options.onwarn = warning => warnings.push(warning)

            // console.log('Building...', name)
            const bundle = await rollup(options)
            // console.log('Writing...', name)
            const { output } = await bundle.write(options.output)
            for (const chunkOrAsset of output) {
                if (chunkOrAsset.type === 'chunk' && chunkOrAsset.isEntry) {
                    importMap.imports[chunkOrAsset.name] =
                        './' +
                        path.relative(
                            outDir,
                            path.join(config.dir, chunkOrAsset.fileName)
                        )
                }
            }
        },
    }))

    const timerLabel = '✨ Built all modules in'
    console.time(timerLabel)
    try {
        await Promise.all(
            bundlers.map(async bundler => {
                await bundler.run()
            })
        )
        warnings.flush()
    } catch (e) {
        warnings.flush()
        console.error('[ERROR]', e.message)
        if (e.frame) {
            console.log(e.frame)
        }
        process.exit(1)
    }
    console.timeEnd(timerLabel)

    fs.writeJSONSync(
        path.resolve(outDir, `import-map.${mode}.json`),
        importMap,
        { spaces: 2 }
    )
    fs.copySync(publicDir + '/', outDir)
}

module.exports = bundle
