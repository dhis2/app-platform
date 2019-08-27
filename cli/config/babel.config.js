const browsersList = require('./.browserlistrc')

module.exports = {
    presets: [
        '@babel/preset-react',
        '@babel/preset-typescript',
        ['@babel/preset-env', { modules: false, targets: browsersList }],
    ],
    plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-object-rest-spread',

        // Always build in "production" mode even when styled-jsx runtime may select "development"
        ['styled-jsx/babel', { optimizeForSpeed: true }],
    ],
}
