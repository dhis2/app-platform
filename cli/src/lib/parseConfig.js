const { reporter } = require('@dhis2/cli-helpers-engine')
const { defaultsDeep, has } = require('lodash')
const fs = require('fs-extra')
const chalk = require('chalk')

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
        let config = {}
        // if (!fs.existsSync(paths.config)) {
        //     reporter.error('Config file d2.config.js not found - use the init command to create one!')
        //     process.exit(1)
        // }

        if (fs.existsSync(paths.config)) {
            reporter.debug('Loading d2 config at', paths.config)
            config = require(paths.config)
            reporter.debug('loaded', config)
        }

        const type = config.type || 'app'
        reporter.debug(`Type identified : ${chalk.bold(type)}`)

        const defaults =
            type === 'lib' ? paths.configDefaultsLib : paths.configDefaultsApp
        config = defaultsDeep(config, require(defaults))

        if (fs.existsSync(paths.package)) {
            config.name = config.name || require(paths.package).name
        }
        config.title = config.title || config.name

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
