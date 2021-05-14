const config = {
    type: 'app',

    pwa: {
        enabled: false,
        caching: {
            omitExternalRequests: true,
            patternsToOmit: [],
            additionalManifestEntries: [],
        },
    },

    entryPoints: {
        app: './src/App',
    },
}

module.exports = config
