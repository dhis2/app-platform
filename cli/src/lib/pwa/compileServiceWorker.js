const path = require('path')
const { reporter } = require('@dhis2/cli-helpers-engine')
const webpack = require('webpack')

function compileServiceWorker({ input, output /* mode */ } = {}) {
    const { dir: outputPath, base: outputFilename } = path.parse(output)
    const config = {
        // mode, // "production" or "development"
        entry: input,
        output: {
            path: outputPath,
            filename: outputFilename,
        },
        target: 'webworker',
        // Appropriate for SW files
        // devtool: 'source-map',
        plugins: [
            // Adds `process.env` to globals
            new webpack.DefinePlugin({
                'process.env': JSON.stringify(process.env),
            }),
        ],
    }

    return new Promise((resolve, reject) => {
        webpack(config, (err, stats) => {
            // TODO: Take more advantage of info in `stats`
            if (err || stats.hasErrors()) {
                reporter.debugErr(err)
                reject(err)
            } else {
                reporter.debug('Service Worker compilation successful')
                resolve()
            }
        })
    })
}

module.exports = compileServiceWorker
