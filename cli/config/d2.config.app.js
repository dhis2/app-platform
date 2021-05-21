const config = {
    type: 'app',

    // TODO: Remove this from default d2.config... handle it elsewhere
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
