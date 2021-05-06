module.exports = {
    swSrc: 'build/service-worker.js',
    swDest: 'build/service-worker.js',
    globDirectory: 'build',
    globPatterns: ['**/*'],
    globIgnores: ['static/**/*'],
    injectionPoint: 'self.__WB_CLI_MANIFEST',
}
