const path = require('path')
const babel = require('@babel/core')
const { reporter, prettyPrint } = require('@dhis2/cli-helpers-engine')
const chokidar = require('chokidar')
const fs = require('fs-extra')
const makeBabelConfig = require('../../../config/makeBabelConfig.js')
const {
    verifyEntrypoints,
    overwriteAppEntrypoint,
} = require('./entrypoints.js')
const {
    extensionPattern,
    normalizeExtension,
} = require('./extensionHelpers.js')

const watchFiles = ({ inputDir, outputDir, processFileCallback, watch }) => {
    const compileFile = async source => {
        const relative = normalizeExtension(path.relative(inputDir, source))
        const destination = path.join(outputDir, relative)
        reporter.debug(
            `File ${relative} changed or added... dest: `,
            path.relative(inputDir, destination)
        )
        await fs.ensureDir(path.dirname(destination))
        await processFileCallback(source, destination)
    }

    const removeFile = async file => {
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
            .on('add', compileFile)
            .on('change', compileFile)
            .on('unlink', removeFile)
            .on('error', error => {
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
    const isApp = config.type === 'app'

    verifyEntrypoints({ config, paths })
    if (isApp) {
        await overwriteAppEntrypoint({
            entrypoint: config.entryPoints.app,
            paths,
        })
    }

    const outDir = isApp
        ? paths.shellApp
        : path.join(paths.buildOutput, moduleType)
    fs.removeSync(outDir)
    fs.ensureDirSync(outDir)

    if (isApp) {
        fs.removeSync(paths.shellPublic)
        fs.copySync(paths.shellSourcePublic, paths.shellPublic)
    }

    const babelConfig = makeBabelConfig({ moduleType, mode })

    const copyFile = async (source, destination) => {
        await fs.copy(source, destination)
    }
    const compileFile = async (source, destination) => {
        if (source.match(extensionPattern)) {
            try {
                const result = await babel.transformFileAsync(
                    source,
                    babelConfig
                )
                await fs.writeFile(destination, result.code)
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
            processFileCallback: compileFile,
            watch,
        }),
        isApp &&
            watchFiles({
                inputDir: paths.public,
                outputDir: paths.shellPublic,
                processFileCallback: copyFile,
                watch,
            }),
    ])
}

module.exports = compile
