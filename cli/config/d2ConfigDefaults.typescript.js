const defaultsApp = {
    type: 'app',

    entryPoints: {
        app: './src/App.tsx',
    },
}

const defaultsLib = {
    type: 'lib',

    entryPoints: {
        lib: './src/index.tsx',
    },
}

module.exports = { defaultsApp, defaultsLib }
