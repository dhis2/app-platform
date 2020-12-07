const path = require('path')

const browserTargets = require('./.browserlistrc')
const jestTargets = { node: 'current' }

const isTest = process.env.NODE_ENV === 'test'

const appBabelConfig = path.resolve(__dirname, 'app.babel.config')

module.exports = ({ modules }) => ({
    extends: appBabelConfig,
    presets: [
        require('@babel/preset-react'),
        require('@babel/preset-typescript'),
        [
            require('@babel/preset-env'),
            {
                modules: isTest ? 'commonjs' : modules,
                targets: isTest ? jestTargets : browserTargets,
            },
        ],
    ],
    plugins: [
        /*
         * Actually transform all the things we added syntax support for in app.babel.config.js
         */

        // plugin-proposal-dynamic-import will be handled by the bundler
        require('@babel/plugin-proposal-class-properties'),
        require('@babel/plugin-proposal-optional-chaining'),
        require('@babel/plugin-proposal-nullish-coalescing-operator'),
    ],
})