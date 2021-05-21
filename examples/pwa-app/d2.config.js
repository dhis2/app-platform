const config = {
    type: 'app',

    standalone: true,
    pwa: {
        enabled: true,
        caching: {
            omitExternalRequests: false,
            // For the purposes of this demo:
            patternsToOmit: ['visualizations'],
        },
    },

    entryPoints: {
        app: './src/App.js',
    },
}

module.exports = config
