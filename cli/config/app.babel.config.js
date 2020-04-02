module.exports = {
    plugins: [
        /*
         * These plugins don't do any transformations.
         * They just prevent a blow-up for syntax supported by Create React App
         */

        // Adds syntax support for arrow-function class properties
        // class { handleClick = () => { } }
        require('@babel/plugin-syntax-class-properties'),

        // Adds syntax support for import()
        require('@babel/plugin-syntax-dynamic-import').default,

        // Adds syntax support for optional chaining (?.)
        require('@babel/plugin-syntax-optional-chaining').default,

        // Adds syntax support for default value using ?? operator
        require('@babel/plugin-syntax-nullish-coalescing-operator').default,

        /*
         * These plugins actually transform code
         */

        // Automatically include a React import when JSX is present
        require('babel-plugin-react-require'),
    ],
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
