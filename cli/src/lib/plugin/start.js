// Based on CRA start script

const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackConfigFactory = require('../../../config/plugin.webpack.config')

module.exports = async ({ port, config, paths }) => {
    const webpackConfig = webpackConfigFactory({
        env: 'development',
        config,
        paths,
    })
    const compiler = webpack(webpackConfig)

    const host = process.env.HOST || 'localhost'
    const publicPath = getPublicUrlOrPath(true, null, process.env.PUBLIC_URL)
    const devServer = new WebpackDevServer(
        {
            port,
            host,
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
