const config = {
    id: 'ASDF1234', // This must match the AppHub ID to successfully publish
    name: 'simple-app',
    title: 'Simple Example App',
    description: 'This is a simple example application',

    // standalone: true, // Don't bake-in a DHIS2 base URL, allow the user to choose

    entryPoints: {
        app: './src/App',
    },
}

module.exports = config
