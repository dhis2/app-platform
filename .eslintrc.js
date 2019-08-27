const { config } = require('@dhis2/cli-style')

module.exports = {
    parser: 'babel-eslint',
    extends: [config.eslint],
    parserOptions: {
        allowImportExportEverywhere: true,
    },
}
