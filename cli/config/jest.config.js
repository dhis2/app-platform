module.exports = {
    verbose: true,
    transform: JSON.stringify({
        '^.+\\.[t|j]sx?$': require.resolve('./jest.transform.js'),
    }),
}
