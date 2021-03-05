const config = {
    buildOptions: {
        root: './src',
        exclude: ['**/__test__', '**/__spec__', /\.(spec|test)\.[jt]sx?/],
        modules: {
            react: {
                input: 'react',
                type: 'umd',
            },
            'react-dom': {
                input: 'react-dom',
                type: 'umd',
            },
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
