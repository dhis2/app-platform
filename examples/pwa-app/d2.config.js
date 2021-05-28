const config = {
    type: 'app',

    standalone: true,
    pwa: {
        enabled: true,
        caching: {
            // Makes sure to cache API requests when in standalone mode
            omitExternalRequests: false,
            // For the purposes of this demo, to simulate dashboard content:
            patternsToOmit: ['visualizations'],
        },
    },

    entryPoints: {
        app: './src/App.js',
    },
}

module.exports = config
