const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const path = require('path')
const rollup = require('rollup')
const fs = require('fs-extra')

const rollupConfigBuilder = require('../../../config/rollup.config')

const printRollupError = error => {
    reporter.debug('Rollup error', error)
    reporter.error(String(error))
    try {
        const file = path.relative(process.cwd(), error.loc.file)
        reporter.error(
            chalk.dim(
                `\tAt ${chalk.bold(file)}:${error.loc.line}:${error.loc.column}`
            )
        )
    } catch (e) {
        // ignore
    }
}

const compileLibrary = async ({ config, paths, mode, watch }) => {
    const input =
        (config.entryPoints && config.entryPoints[config.type]) ||
        'src/index.js'
    const outDir = mode === 'production' ? paths.buildOutput : paths.devOut

    fs.removeSync(outDir)
    fs.ensureDirSync(outDir)

    const pkg = require(paths.package)

    const rollupConfig = rollupConfigBuilder({
        cwd: paths.base,
        entryPointName: config.type,
        entryPoint: path.join(paths.base, input),
        outDir,
        mode,
        bundleDeps: false,
        pkg,
    })

    const outFile = path.join(outDir, `es/${config.type}.js`)

    reporter.print(
        chalk.dim(
            `Compiling ${chalk.bold(input)} to ${chalk.bold(
                path.relative(process.cwd(), outFile)
            )}`
        )
    )

    reporter.debug('Rollup config', rollupConfig)

    const copyOutput = async () => {
        await fs.copy(outFile, path.join(paths.shellApp, `${config.type}.js`))
        if (mode === 'production') {
            await fs.copy(
                outFile + '.map',
                path.join(paths.shellApp, `${config.type}.js.map`)
            )
        }
    }

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
            printRollupError(e)
            process.exit(1)
        }

        await fs.remove(paths.shellApp)
        await fs.ensureDir(paths.shellApp)

        await copyOutput()
    } else {
        return new Promise((resolve, reject) => {
            reporter.debug('watching...')
            const watcher = rollup.watch({
                ...rollupConfig,
            })

            watcher.on('event', async event => {
                reporter.debug('[watch]', event.code, event)
                if (event.code === 'START') {
                    reporter.print(chalk.dim('Compiling...'))
                } else if (event.code === 'END') {
                    await copyOutput()
                    reporter.print(chalk.dim(' Compiled successfully!'))
                    resolve() // This lets us wait for the first successful compilation
                } else if (event.code === 'ERROR') {
                    printRollupError(event.error)
                } else if (event.code === 'FATAL') {
                    printRollupError(event.error)
                    reject('Fatal error, aborting...')
                } else {
                    reporter.debug(
                        '[watch] Encountered an unknown event',
                        event
                    )
                }
            })

            process.on('SIGINT', function() {
                reporter.debug('Caught interrupt signal')
                watcher.close()
            })
        })
    }
}

module.exports = compileLibrary
