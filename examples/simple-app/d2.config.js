const path = require('path')

/** @type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    id: 'ASDF1234', // This must match the AppHub ID to successfully publish
    name: 'simple-app',
    title: 'Simple Example App',
    description: 'This is a simple example application',
    direction: 'auto',

    // standalone: true, // Don't bake-in a DHIS2 base URL, allow the user to choose

    entryPoints: {
        app: './src/App.jsx',
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

    viteConfigExtensions: path.join(__dirname, 'viteConfigExtensions.mjs'),
}

module.exports = config
