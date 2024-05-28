const config = {
    type: 'app',

    pwa: {
        enabled: true,
        caching: {
            // For the purposes of this demo, to simulate dashboard content:
            patternsToOmitFromAppShell: ['visualizations'],
            // To test precache filtering: (relative to PUBLIC_DIR)
            globsToOmitFromPrecache: ['exclude-from-precache/**'],
        },
    },

    entryPoints: {
        app: './src/App.js',
        // Uncomment this to test plugin builds:
        // plugin: './src/components/VisualizationsList.js',
    },

    // pluginType: 'DASHBOARD',
    skipPluginLogic: true,
}

module.exports = config
