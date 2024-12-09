module.exports = {
    verbose: true,
    transform: {
        '^.+\\.[t|j]sx?$': require.resolve('./jest.transform.js'),
    },
    // Need to apply babel transformations to modules under moment/dist/,
    // which use ES module format. See localeUtils.js in the adapter
    transformIgnorePatterns: ['/node_modules/(?!moment/dist/)'],
    moduleNameMapper: {
        '\\.(css|less)$': require.resolve('./jest.identity.mock.js'),
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            require.resolve('./jest.file.mock.js'),
        '^styled-jsx/(css|macro)$': require.resolve(
            './jest.styled-jsx-css.mock.js'
        ),
    },
    testEnvironment: 'jsdom',
}
