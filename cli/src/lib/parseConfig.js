const { reporter } = require('@dhis2/cli-helpers-engine')
const { defaultsDeep, has } = require('lodash')
const chalk = require('chalk')

const defaultConfig = require('../../config/d2.config')

const requiredConfigFields = {
    app: ['name', 'title', 'entryPoints.app'],
    lib: ['name', 'entryPoints.lib'],
}

const validateConfig = config => {
    if (!requiredConfigFields[config.type]) {
        reporter.error(
            `Unknown type ${chalk.bold(config.type)} specified in d2.config.js.`
        )
        reporter.error(`\tValid types:`, Object.keys(requiredConfigFields))
        process.exit(1)
    }
    requiredConfigFields[config.type].forEach(field => {
        if (!has(config, field)) {
            reporter.error(
                `Required config field ${chalk.bold(
                    field
                )} not found in d2.config.js`
            )
            process.exit(1)
        }
    })
    return true
}

const parseConfig = paths => {
    try {
        reporter.debug('Load d2 config at', paths.config)

        let config = require(paths.config)
        config = defaultsDeep(config, defaultConfig)

        validateConfig(config)

        reporter.debug('config loaded', config)
        return config
    } catch (e) {
        reporter.error('Failed to load d2 config!')
        reporter.debugErr(e)
        process.exit(1)
    }
}

module.exports = parseConfig
