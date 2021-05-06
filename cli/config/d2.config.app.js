const config = {
    type: 'app',

    pwa: {
        enabled: false,
        caching: {
            omitExternalRequests: true,
            patternsToOmit: [],
            filesToPrecache: [],
        },
    },

    entryPoints: {
        app: './src/App',
    },
}

module.exports = config
