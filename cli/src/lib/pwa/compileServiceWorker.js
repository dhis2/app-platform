const path = require('path')
const { reporter } = require('@dhis2/cli-helpers-engine')
const webpack = require('webpack')
const getEnv = require('../shell/env')
const getPWAEnvVars = require('./getPWAEnvVars')

/**
 * Uses webpack to bundle a service worker. If used in development mode,
 * compiles in development mode and outputs the service worker to the `public`
 * dir for use with a dev server. In production mode, compiles a minified
 * service worker and outputs it into the apps `build` dir.
 *
 * Currently used only for 'dev' SWs, since CRA handles production bundling.
 * TODO: Use this for production bundling as well, which gives greater control
 * over 'injectManifest' configuration (CRA omits files > 2MB) and bundling
 * options.
 *
 * @param {Object} param0
 * @param {Object} param0.config - d2 app config
 * @param {Object} param0.paths - `paths` object in CLI
 * @param {String} param0.mode - `'production'` or `'development'` (or other valid webpack `mode`s)
 * @returns {Promise}
 */
function compileServiceWorker({ config, paths, mode }) {
    // Choose appropriate destination for compiled SW based on 'mode'
    const isProduction = mode === 'production'
    const outputPath = isProduction
        ? paths.shellBuildServiceWorker
        : paths.shellPublicServiceWorker
    const { dir: outputDir, base: outputFilename } = path.parse(outputPath)

    // This is part of a bit of a hacky way to provide the same env vars to dev
    // SWs as in production by adding them to `process.env` using the plugin
    // below.
    // TODO: This could be cleaner if the production SW is built in the same
    // TODO: It is now; clean this up
    // way instead of using the CRA webpack config, so both can more easily
    // share environment variables.
    const env = getEnv({ name: config.title, ...getPWAEnvVars(config) })

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
            new webpack.DefinePlugin({
                'process.env': JSON.stringify({
                    ...process.env,
                    ...env,
                }),
            }),
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
                info.errors.forEach(logErr)
                reject('Service worker compilation error')
                return
            }

            reporter.debug('Service Worker compilation successful')
            resolve()
        })
    })
}

module.exports = compileServiceWorker
