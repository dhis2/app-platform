const app = {
    name: 'simple', // (UNIMPLEMENTED) This will be the URL of the app relative to the server
    title: 'Simple Example App', // This will show up in the HeaderBar
    description: 'This is a simple example application', // (UNIMPLEMENTED) This might be used for something in the future...
    entryPoints: {
        // (UNIMPLEMENTED)
        App: {
            source: require.resolve('./src/App'),
        },
        // Plugin: {
        //     source: require.resolve('./Plugin')
        // }
    },
}

module.exports = { app }
