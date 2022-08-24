// Based on CRA start script

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'

const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackConfigFactory = require('./webpack.config')

module.exports = async ({ port, paths }) => {
    const webpackConfig = webpackConfigFactory({ env: 'production', paths })
    const compiler = webpack(webpackConfig)

    const host = process.env.HOST || 'localhost'
    const publicPath = getPublicUrlOrPath(true, null, process.env.PUBLIC_URL)
    const devServer = new WebpackDevServer(
        {
            port,
            host,
            // open browser
            open: ['/plugin.html'],
            client: {
                logging: 'none',
                overlay: {
                    warnings: false,
                },
            },
            magicHtml: false,
            static: {
                directory: paths.shellPublic,
                // remove last slash so user can land on `/test` instead of `/test/`
                publicPath: publicPath.slice(0, -1),
            },
            hot: true,
            setupExitSignals: true,
        },
        compiler
    )
    await devServer.start()
}
