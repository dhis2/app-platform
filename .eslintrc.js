const { config } = require('@dhis2/cli-style')

module.exports = {
    extends: [config.eslintReact],
    parserOptions: {
        allowImportExportEverywhere: true,
    },
    rules: {
        'import/extensions': 'off',
        'react/no-unknown-property': ['error', { ignore: ['jsx'] }],
    },
    ignorePatterns: ['index.d.ts'],
    overrides: [
        {
            files: ['*.test.js'],
            rules: {
                'react/prop-types': 'off',
            },
        },
    ],
}
