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
    const outDir = paths.buildOutput

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

    reporter.print(chalk.green(' - Entrypoint :'), chalk.yellow(input))
    reporter.print(
        chalk.green(' - Output Directory :'),
        chalk.yellow(path.relative(paths.base, outDir))
    )

    reporter.debug('Rollup config', rollupConfig)

    if (!watch) {
        fs.removeSync(outDir)
        fs.ensureDirSync(outDir)

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
    } else {
        fs.ensureDirSync(outDir)

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
