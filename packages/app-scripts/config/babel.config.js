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
        'styled-jsx/babel',
    ],
}
