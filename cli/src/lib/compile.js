const { reporter } = require('@dhis2/cli-helpers-engine')

const path = require('path')
const fs = require('fs-extra')
const rollup = require('rollup')

const rollupConfigBuilder = require('../../config/rollup.config')

const compile = async ({
    config,
    paths,
    mode = 'development',
    watch = false,
} = {}) => {
    const input =
        (config.entryPoints && config.entryPoints[config.type]) ||
        'src/index.js'
    const outDir = mode === 'production' ? paths.buildOutput : paths.devOut

    reporter.info(`Compiling ${input} to ${outDir}`)

    fs.removeSync(outDir)
    fs.ensureDirSync(outDir)

    const pkg = require(paths.package)

    const rollupConfig = rollupConfigBuilder({
        cwd: paths.base,
        entryPointName: config.type,
        entryPoint: path.join(paths.base, input),
        outDir,
        mode,
        bundleDeps: config.type === 'app',
        pkg,
    })

    reporter.debug('Rollup config', rollupConfig)

    if (!watch) {
        // create a bundle
        try {
            const bundle = await rollup.rollup(rollupConfig)

            // or write the bundle to disk
            const outputs = Array.isArray(rollupConfig.output)
                ? rollupConfig.output
                : [rollupConfig.output]
            reporter.debug('outputs', outputs)

            await Promise.all(
                outputs.map(async outputConfig => {
                    const { output } = await bundle.generate(outputConfig)
                    for (const chunkOrAsset of output) {
                        reporter.debug(
                            chunkOrAsset.isAsset
                                ? `[${outputConfig.format}] - ASSET - `
                                : `[${outputConfig.format}] - CHUNK ${chunkOrAsset.name} - MODULES - `,
                            chunkOrAsset.isAsset
                                ? chunkOrAsset
                                : Object.keys(chunkOrAsset.modules)
                        )
                    }
                    return await bundle.write(outputConfig)
                })
            )
        } catch (e) {
            reporter.error(e)
            process.exit(1)
        }
    } else {
        reporter.debug('watching...')
        const watcher = rollup.watch({
            ...rollupConfig,
            watch: {
                clearScreen: true,
            },
        })

        watcher.on('event', async event => {
            reporter.debug('[watch]', event.code)
            if (event.code === 'BUNDLE_START') {
                reporter.print('Rebuilding...')
            } else if (event.code === 'BUNDLE_END') {
                await fs.copy(
                    path.join(outDir, `es/${config.type}.js`),
                    path.join(paths.shellApp, `${config.type}.js`)
                )
                reporter.print('DONE')
            }
        })

        process.on('SIGINT', function() {
            reporter.debug('Caught interrupt signal')

            watcher.close()
            process.exit()
        })
        await new Promise(() => null) // Wait forever
    }

    await fs.remove(paths.shellApp)
    await fs.ensureDir(paths.shellApp)

    await fs.copy(
        path.join(outDir, `es/${config.type}.js`),
        path.join(paths.shellApp, `${config.type}.js`)
    )
    if (mode === 'production') {
        await fs.copy(
            path.join(outDir, `es/${config.type}.js.map`),
            path.join(paths.shellApp, `${config.type}.js.map`)
        )
    }
}

module.exports = compile
