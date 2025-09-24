const browserTargets = require('./.browserlistrc')
const jestTargets = { node: 'current' }

const getBabelModuleType = (moduleType) => {
    switch (moduleType) {
        case 'cjs':
        case 'commonjs':
            return 'commonjs'
        case 'systemjs':
        case 'umd':
        case 'amd':
            return moduleType
        case 'es':
        default:
            return false
    }
}
const makeBabelConfig = ({ moduleType, mode, isAppType }) => {
    const isTest = mode === 'test'

    const styledJsxConfig = {
        env: {
            production: {
                plugins: [
                    [require('styled-jsx/babel'), { optimizeForSpeed: true }],
                ],
            },
            development: {
                plugins: [
                    [require('styled-jsx/babel'), { optimizeForSpeed: true }],
                ],
            },
            test: {
                plugins: [require('styled-jsx/babel-test')],
            },
        },
    }

    // Minimal transpiling for apps
    if (isAppType) {
        return {
            presets: ['@babel/preset-typescript'],
            ...styledJsxConfig,
        }
    }

    // More for libs
    return {
        presets: [
            require('@babel/preset-react'),
            require('@babel/preset-typescript'),
            [
                require('@babel/preset-env'),
                {
                    modules: isTest
                        ? 'commonjs'
                        : getBabelModuleType(moduleType),
                    targets: isTest ? jestTargets : browserTargets,
                },
            ],
        ],
        plugins: [
            // Adds syntax support for import()
            require('@babel/plugin-syntax-dynamic-import').default,

            /*
             * These plugins actually transform code
             */

            // Automatically include a React import when JSX is present
            require('babel-plugin-react-require'),

            // Adds support for arrow-function class properties
            // class { handleClick = () => { } }
            require('@babel/plugin-transform-class-properties'),

            // Adds syntax support for optional chaining (?.)
            require('@babel/plugin-transform-optional-chaining'),

            // Adds support for default value using ?? operator
            require('@babel/plugin-transform-nullish-coalescing-operator'),

            // Adds support for private class properties and methods using # prefix
            '@babel/plugin-transform-private-methods',
            '@babel/plugin-transform-private-property-in-object',
        ],
        ...styledJsxConfig,
    }
}

module.exports = makeBabelConfig
