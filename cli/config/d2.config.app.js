const baseConfig = require('./d2.config.base.js')

const config = {
    ...baseConfig,
    type: 'app',

    entryPoints: {
        app: './src/App',
        bootstrap: require.resolve('./defaultAppBootstrap.js')
    },
}

module.exports = config
