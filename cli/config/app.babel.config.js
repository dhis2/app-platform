module.exports = {
    plugins: [
        require('@babel/plugin-proposal-class-properties'),

        // Always build in "production" mode even when styled-jsx runtime may select "development"
        [require('styled-jsx/babel'), { optimizeForSpeed: true }],
    ],
}
