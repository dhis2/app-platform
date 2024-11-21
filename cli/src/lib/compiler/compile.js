const path = require('path')
const babel = require('@babel/core')
const { reporter, prettyPrint } = require('@dhis2/cli-helpers-engine')
const chokidar = require('chokidar')
const fs = require('fs-extra')
const makeBabelConfig = require('../../../config/makeBabelConfig.js')
const { isApp } = require('../parseConfig')
const {
    verifyEntrypoints,
    createAppEntrypointWrapper,
    createPluginEntrypointWrapper,
} = require('./entrypoints.js')
const {
    extensionPattern,
    normalizeExtension,
} = require('./extensionHelpers.js')

const watchFiles = ({ inputDir, outputDir, processFileCallback, watch }) => {
    const processFile = async (source) => {
        const relative = path.relative(inputDir, source)
        const destination = path.join(outputDir, relative)
        reporter.debug(`File ${relative} changed or added...`)
        await fs.ensureDir(path.dirname(destination))
        await processFileCallback(source, destination)
    }

    const removeFile = async (file) => {
        const relative = path.relative(inputDir, file)
        const outFile = path.join(outputDir, relative)
        reporter.debug(`File ${relative} removed... removing: `, outFile)
        fs.remove(outFile)
    }

    return new Promise((resolve, reject) => {
        const watcher = chokidar.watch(inputDir, { persistent: true })

        watcher
            .on('ready', async () => {
                if (watch) {
                    reporter.debug('watching...')
                } else {
                    await watcher.close()
                }
                resolve()
            })
            .on('add', processFile)
            .on('change', processFile)
            .on('unlink', removeFile)
            .on('error', (error) => {
                reporter.debugErr('Chokidar error:', error)
                reject('Chokidar error!')
            })

        process.on('SIGINT', async () => {
            reporter.debug('Caught interrupt signal')
            await watcher.close()
        })
    })
}

const compile = async ({
    config,
    paths,
    moduleType = 'es',
    mode = 'development',
    watch = false,
}) => {
    const isAppType = isApp(config.type)

    verifyEntrypoints({ config, paths })
    if (isAppType) {
        if (config.entryPoints.app) {
            await createAppEntrypointWrapper({
                entrypoint: config.entryPoints.app,
                paths,
            })
        }
        if (config.entryPoints.plugin) {
            await createPluginEntrypointWrapper({
                entrypoint: config.entryPoints.plugin,
                paths,
            })
        }
    }

    const outDir = isAppType
        ? paths.shellApp
        : path.join(paths.buildOutput, moduleType)
    fs.removeSync(outDir)
    fs.ensureDirSync(outDir)

    if (isAppType) {
        fs.removeSync(paths.shellPublic)
        fs.copySync(paths.shellSourcePublic, paths.shellPublic)
    }

    const babelConfig = makeBabelConfig({ moduleType, mode })

    const copyFile = async (source, destination) => {
        reporter.debug(`Copying ${source} to ${destination}`)
        await fs.copy(source, destination)
    }
    const compileFile = async (source, destination) => {
        if (source.match(extensionPattern)) {
            try {
                const result = await babel.transformFileAsync(
                    source,
                    babelConfig
                )

                // Always write .js files
                const jsDestination = normalizeExtension(destination)

                reporter.debug(
                    `Compiled ${source} with Babel, saving to ${jsDestination}`
                )

                await fs.writeFile(jsDestination, result.code)
            } catch (err) {
                reporter.dumpErr(err)
                reporter.error(
                    `Failed to compile ${prettyPrint.relativePath(
                        source
                    )}. Fix the problem and save the file to automatically reload.`
                )
            }
        } else {
            await copyFile(source, destination)
        }
    }

    return Promise.all([
        watchFiles({
            inputDir: paths.src,
            outputDir: outDir,
            // todo: handle lib compilations with Vite
            processFileCallback: isAppType ? copyFile : compileFile,
            watch,
        }),
        isAppType &&
            watchFiles({
                inputDir: paths.public,
                outputDir: paths.shellPublic,
                processFileCallback: copyFile,
                watch,
            }),
    ])
}

module.exports = compile
