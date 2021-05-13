/**
 * TODO
 * Build and minify service worker with injectManifest config,
 * Injecting precache manifest from static assets in specified dir
 */

// Need webpack, workbox-webpack-plugin
// find a regex to 'not cache bust' files with hashes in name
// How will I handle env vars and d2.config?

// TODO: Add dependencies

import webpack from 'webpack'
import { InjectManifest } from 'workbox-webpack-plugin'

const injectManifestDefaultOptions = {
    // Oh... where is this going to be at run time?
    swSrc: './service-worker.js',
    swDest: 'build/service-worker.js',
    globDirectory: 'build',
    globPatterns: ['**/*'],
    injectionPoint: 'self.__WB_MANIFEST',
}

// Config: { precacheDir, destDir, additionalEntries, ... }
export default function buildSw(config) {
    const webpackConfig = {
        entry: null,
        plugins: [
            new InjectManifest({
                ...injectManifestDefaultOptions,
                ...config.injectManifestOptions,
            }),
        ],
    }

    return new Promise((resolve, reject) => {
        webpack(webpackConfig, (err, stats) => {
            if (err) {
                console.error(err.stack || err)
                if (err.details) {
                    console.error(err.details)
                }
                reject(err)
            }

            const info = stats.toJson()
            if (stats.hasErrors()) console.error(info.errors)
            if (stats.hasWarnings()) console.warn(info.warnings)
            console.log(stats.toString({ colors: true }))

            resolve(info)
        })
    })
}
