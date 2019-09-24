const browserTargets = require('./.browserlistrc')
const jestTargets = { node: 'current' }

const isTest = process.env.NODE_ENV === 'test'
const targets = isTest ? jestTargets : browserTargets

module.exports = {
    presets: [
        require('@babel/preset-react'),
        require('@babel/preset-typescript'),
        [
            require('@babel/preset-env'),
            {
                modules: 'auto',
                targets,
            },
        ],
    ],
    plugins: [
        require('@babel/plugin-proposal-class-properties'),
        require('@babel/plugin-proposal-object-rest-spread'),

        // Always build in "production" mode even when styled-jsx runtime may select "development"
        [require('styled-jsx/babel'), { optimizeForSpeed: true }],
    ],
}
