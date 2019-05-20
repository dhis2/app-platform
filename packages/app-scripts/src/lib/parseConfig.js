const { reporter } = require('@dhis2/cli-helpers-engine')

const parseConfig = paths => {
    try {
        reporter.debug('Load d2 config at', paths.config)
        return require(paths.config)
    } catch (e) {
        reporter.error('Failed to load d2 config!')
        reporter.debugErr(e)
        process.exit(1)
    }
}

module.exports = parseConfig
