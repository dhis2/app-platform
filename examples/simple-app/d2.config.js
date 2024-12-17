const config = {
    id: 'ASDF1234', // This must match the AppHub ID to successfully publish
    name: 'simple-app',
    title: 'Simple Example App',
    description: 'This is a simple example application',
    direction: 'auto',

    // standalone: true, // Don't bake-in a DHIS2 base URL, allow the user to choose

    entryPoints: {
        // todo: edit these after testing plugin changes
        app: './src/PluginTester.jsx',
        plugin: './src/Plugin.tsx',
    },

    dataStoreNamespace: 'testapp-namespace',
    customAuthorities: ['testapp-authority'],
    additionalNamespaces: [
        {
            namespace: 'testapp-additional-namespace1',
            authorities: ['testapp-additional-auth'],
        },
        {
            namespace: 'testapp-additional-namespace2',
            writeAuthorities: ['testapp-additional-write'],
            readAuthorities: ['testapp-additional-read'],
        },
    ],

    minDHIS2Version: '2.35',
}

module.exports = config
