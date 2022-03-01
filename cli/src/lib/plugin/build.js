// Based on CRA build script

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production'
process.env.NODE_ENV = 'production'

const webpack = require('webpack')
const webpackConfigFactory = require('./webpack.config')

module.exports = async ({ paths }) => {
    console.log('Building plugin...')

    const webpackConfig = webpackConfigFactory({ env: 'production', paths })
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
                        info.errors.map(error => error.message).join('\n')
                    )
                )
                return
            }

            /*if (stats.hasWarnings()) {
                console.warn(
                    info.warnings.map(warning => warning.message).join('\n')
                )
            }*/

            resolve()
        })
    })
}
