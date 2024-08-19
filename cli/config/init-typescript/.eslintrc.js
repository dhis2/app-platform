// eslint-disable-next-line @typescript-eslint/no-var-requires
const { config } = require('@dhis2/cli-style')

module.exports = {
    extends: [
        config.eslintReact,
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript',
    ],
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
    },
    globals: {
        cy: 'readonly',
        Cypress: 'readonly',
    },
    rules: {
        'react/prop-types': 'off',
        'react/display-name': 'off',
        'import/extensions': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
    },
}
