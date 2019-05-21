const app = {
    name: 'usage-analytics', // (UNIMPLEMENTED) This will be the URL of the app relative to the server
    title: 'Usage Analytics', // This will show up in the HeaderBar
    description: 'Analyze usage patterns in DHIS2', // (UNIMPLEMENTED) This might be used for something in the future...
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
