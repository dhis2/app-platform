const browsersList = require('./.browserlistrc')

module.exports = {
    presets: [
        require('@babel/preset-react'),
        require('@babel/preset-typescript'),
        [
            require('@babel/preset-env'),
            { modules: 'auto', targets: browsersList },
        ],
    ],
    plugins: [
        require('@babel/plugin-proposal-class-properties'),
        require('@babel/plugin-proposal-object-rest-spread'),

        // Always build in "production" mode even when styled-jsx runtime may select "development"
        [require('styled-jsx/babel'), { optimizeForSpeed: true }],
    ],
}
