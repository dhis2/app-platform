const { config } = require('@dhis2/cli-style')

module.exports = {
    extends: [config.eslintReact],
    parserOptions: {
        allowImportExportEverywhere: true,
    },
    ignorePatterns: [
        './gql-to-app-runtime-query/src/__test__/code.js',
        './gql-to-app-runtime-query/src/__test__/runtimeQuery.js',
    ],
}
