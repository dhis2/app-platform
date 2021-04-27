const config = {
    type: 'app',

    pwa: {
        enabled: false,
        caching: { patternsToOmit: [], filesToPrecache: [] },
    },

    entryPoints: {
        app: './src/App',
    },
}

module.exports = config
