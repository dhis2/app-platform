const baseConfig = require('./d2.config.base.js')

const config = {
    ...baseConfig,
    type: 'app',

    entryPoints: {
        app: './src/App',
    },
}

module.exports = config
