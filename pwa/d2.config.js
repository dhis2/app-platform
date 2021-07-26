const config = {
    type: 'lib',

    entryPoints: {
        lib: {
            '.': {
                browser: './src/browser/index.js',
                worker: './src/sw/index.js',
            },
            './browser': './src/browser/index.js',
            './sw': './src/sw/index.js',
        },
    },
}

module.exports = config
