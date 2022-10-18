const { config } = require('@dhis2/cli-style')

module.exports = {
    extends: [config.eslintReact],
    parserOptions: {
        allowImportExportEverywhere: true,
    },
    rules: {
        'import/extensions': 'off',
    },
    overrides: [
        {
            files: ['*.test.js'],
            rules: {
                'react/prop-types': 'off',
            },
        },
    ],
}
