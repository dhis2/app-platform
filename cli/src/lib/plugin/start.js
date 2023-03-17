// Based on CRA start script

const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackConfigFactory = require('../../../config/plugin.webpack.config')

module.exports = async ({ port, config, paths }) => {
    const webpackConfig = webpackConfigFactory({
        // todo: change to development, but this creates a compilation error
        // can read more here: https://github.com/dhis2/app-platform/pull/740/files/69411d9b61845cbd0d053f2313bdbd4e80fdf2ac#r1031576956
        env: 'production',
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
            // open browser
            open: [`/${paths.pluginLaunchPath}`],
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
