const config = {
    type: 'app',

    // sets the `dir` HTML attribute for the app:
    // options are 'ltr', 'rtl', and 'auto'. If set to 'auto', the direction
    // will be inferred by the user's UI locale.
    // The header bar direction will always be set by the locale.
    direction: 'ltr',

    entryPoints: {
        app: './src/App.js',
    },
}

module.exports = config
