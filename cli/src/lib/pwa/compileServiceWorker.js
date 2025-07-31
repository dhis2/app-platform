const path = require('path')
const { reporter } = require('@dhis2/cli-helpers-engine')
const webpack = require('webpack')

/**
 * Uses webpack to bundle a service worker. If used in development mode,
 * compiles in development mode and outputs the service worker to the `public`
 * dir for use with a dev server. In production mode, compiles a minified
 * service worker and outputs it into the apps `build` dir.
 *
 * This could be migrated to a Vite config. Note that it still needs to be
 * separate from the main app's Vite build because the SW needs a
 * single-file IIFE output
 *
 * @param {Object} param0
 * @param {Object} param0.config - d2 app config
 * @param {Object} param0.paths - `paths` object in CLI
 * @param {String} param0.mode - `'production'` or `'development'` (or other valid webpack `mode`s)
 * @returns {Promise}
 */
function compileServiceWorker({ env, paths, mode }) {
    // Choose appropriate destination for compiled SW based on 'mode'
    const isProduction = mode === 'production'
    const outputPath = isProduction
        ? paths.shellBuildServiceWorker
        : paths.shellPublicServiceWorker
    const { dir: outputDir, base: outputFilename } = path.parse(outputPath)

    const webpackConfig = {
        mode, // "production" or "development"
        devtool: isProduction ? false : 'source-map',
        entry: paths.shellSrcServiceWorker,
        output: {
            path: outputDir,
            filename: outputFilename,
        },
        target: 'webworker',
        plugins: [
            // Make sure SW has the same env vars as the app
            new webpack.DefinePlugin({ 'process.env': JSON.stringify(env) }),
        ],
    }

    return new Promise((resolve, reject) => {
        const logErr = (err) => {
            reporter.debugErr(err.stack || err)
            if (err.details) {
                reporter.debugErr(err.details)
            }
        }

        webpack(webpackConfig, (err, stats) => {
            if (err) {
                logErr(err)
                reject('Service worker compilation error')
            }

            const info = stats.toJson()

            if (stats.hasWarnings()) {
                reporter.warn(`There are ${info.warnings.length} warnings`)
                reporter.debug('Warnings:', info.warnings)
            }

            if (stats.hasErrors()) {
                reporter.error(JSON.stringify(info.errors, null, 2))
                info.errors.forEach(logErr)
                reject('Service worker compilation error')
                return
            }

            reporter.debug(
                'Service Worker compilation successful. Size:',
                info.assets[0].size,
                'bytes'
            )
            const outputPath = path.join(info.outputPath, info.assets[0].name)
            reporter.debug('Output:', outputPath)
            resolve()
        })
    })
}

module.exports = compileServiceWorker
