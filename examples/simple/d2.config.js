const app = {
    name: 'simple', // This will be the URL of the app relative to the server
    title: 'Simple Example App', // This will show up in the HeaderBar
    description: 'This is a simple example application', // This might be used for something in the future...
    entryPoints: {
        App: {
            source: require.resolve('./src/App'), // Currently unused
        },
        // Plugin: {
        //     source: require.resolve('./Plugin')
        // }
    },
}

module.exports = { app }
