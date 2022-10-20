const config = {
    type: 'app',
    name: 'pwa-example',
    title: 'PWA Example',

    pwa: {
        enabled: true,
        caching: {
            // For the purposes of this demo, to simulate dashboard content:
            patternsToOmitFromAppShell: ['visualizations'],
        },
    },

    entryPoints: {
        app: './src/App.js',
    },
}

module.exports = config
