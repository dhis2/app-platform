module.exports = {
    verbose: true,
    transform: {
        '^.+\\.[t|j]sx?$': require.resolve('./jest.transform.js'),
    },
    moduleNameMapper: {
        '^.+\\.(css|less)$': require.resolve('./jest.identity.mock.js'),
    },
}
