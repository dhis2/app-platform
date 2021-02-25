const path = require('path')
const babel = require('@babel/core')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const chokidar = require('chokidar')
const fs = require('fs-extra')
const makeBabelConfig = require('../../../config/makeBabelConfig.js')

const extensionPattern = /\.[jt]sx?$/
const overwriteEntrypoint = async ({ config, paths }) => {
    const isApp = config.type === 'app'
    const entrypoint = isApp ? config.entryPoints.app : config.entryPoints.lib
    if (!entrypoint.match(/^(\.\/)?src\//)) {
        const msg = `App entrypoint ${chalk.bold(
            entrypoint
        )} must be located within the ${chalk.bold('./src')} directory`
        reporter.error(msg)
        throw new Error(msg)
    }

    const relativeEntrypoint = entrypoint.replace(/^(\.\/)?src\//, '')

    try {
        require.resolve(path.join(paths.base, entrypoint))
    } catch (e) {
        const msg = `Could not resolve app entrypoint ${chalk.bold(entrypoint)}`
        reporter.error(msg)
        throw new Error(msg)
    }

    const outRelativeEntrypoint = relativeEntrypoint.replace(
        extensionPattern,
        '.js'
    )

    if (isApp) {
        const shellAppSource = await fs.readFile(paths.shellSourceEntrypoint)
        await fs.writeFile(
            paths.shellAppEntrypoint,
            shellAppSource
                .toString()
                .replace(
                    /'.\/D2App\/app'/g,
                    `'./D2App/${outRelativeEntrypoint}'`
                )
        )
    }
}

const watchFiles = ({ inputDir, outputDir, processFileCallback, watch }) => {
    const compileFile = async source => {
        const relative = path
            .relative(inputDir, source)
            .replace(extensionPattern, '.js')
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
    await overwriteEntrypoint({ config, paths })

    const isApp = config.type === 'app'
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
            const result = await babel.transformFileAsync(source, babelConfig)
            await fs.writeFile(destination, result.code)
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
