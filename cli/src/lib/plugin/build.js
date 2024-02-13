// Based on CRA build script

const { reporter } = require('@dhis2/cli-helpers-engine')
const webpack = require('webpack')
const webpackConfigFactory = require('../../../config/plugin.webpack.config')

module.exports = async ({ config, paths, pluginifiedApp }) => {
    reporter.debug('Building plugin...')

    const webpackConfig = webpackConfigFactory({
        env: 'production',
        config,
        paths,
        pluginifiedApp,
    })
    const compiler = webpack(webpackConfig)
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                if (!err.message) {
                    reject(err)
                    return
                }

                let errMessage = err.message
                // Add additional information for postcss errors
                if (Object.prototype.hasOwnProperty.call(err, 'postcssNode')) {
                    errMessage +=
                        '\nCompileError: Begins at CSS selector ' +
                        err['postcssNode'].selector
                }

                reject(new Error(errMessage))
                return
            }

            const info = stats.toJson()

            if (stats.hasErrors()) {
                reject(
                    new Error(
                        info.errors.map((error) => error.message).join('\n')
                    )
                )
                return
            }

            if (stats.hasWarnings()) {
                for (const warning of info.warnings) {
                    reporter.warn(warning.message)
                }
            }

            resolve()
        })
    })
}
