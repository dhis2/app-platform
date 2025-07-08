/**
 * Note that these values are different from the boilerplate files that
 * are copied when using `d2-app-scripts init` -- these are used as defaults
 * when parsing d2 config of existing apps
 *
 * The boilerplate files live in /config/init/
 */

const defaultsApp = {
    type: 'app',

    entryPoints: {
        app: './src/App.jsx',
    },
}

const defaultsLib = {
    type: 'lib',

    entryPoints: {
        lib: './src/index.jsx',
    },
}

module.exports = { defaultsApp, defaultsLib }
