const baseConfig = require('./d2.config.base.js')

const config = {
    ...baseConfig,
    type: 'app',
    shell: '@dhis2/app-shell', // TODO: implement

    entryPoints: {
        app: './src/App.js',
        bootstrap: require.resolve('./bootstrap.js'),
    },

    buildOptions: {
        ...baseConfig.buildOptions,
        modules: {
            react: {
                input: 'react',
                type: 'umd',
            },
            'react-dom': {
                input: 'react-dom',
                type: 'umd',
            },
            '@dhis2/app-adapter': '@dhis2/app-adapter',
            '@dhis2/app-runtime': '@dhis2/app-runtime',
            '@dhis2/d2-i18n': '@dhis2/d2-i18n',
            moment: 'moment',
            '@dhis2/ui': '@dhis2/ui',
            'styled-jsx/style': 'styled-jsx/dist/style.js',
            d2: {
                input: 'd2/src/d2.js', // Use ES modules source instead of CJS build
                type: 'umd',
            },
        },
    },
}

module.exports = config
