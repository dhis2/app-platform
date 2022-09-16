const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const { defaultsDeep, has, isPlainObject } = require('lodash')
const parseAuthorString = require('parse-author')

const requiredConfigFields = {
    app: ['name', 'version', 'title', 'entryPoints.app'],
    lib: ['name', 'version', 'entryPoints.lib'],
}

const parseAuthor = (author) => {
    if (isPlainObject(author)) {
        return {
            name: author.name,
            email: author.email,
            url: author.url,
        }
    }

    if (typeof author === 'string') {
        return parseAuthorString(author)
    }

    return undefined
}

const validateConfig = (config) => {
    if (!requiredConfigFields[config.type]) {
        throw new Error(
            `Unknown type ${chalk.bold(
                config.type
            )} specified in d2.config.js.\n\tValid types: ${Object.keys(
                requiredConfigFields
            )}`
        )
    }
    requiredConfigFields[config.type].forEach((field) => {
        if (!has(config, field)) {
            throw new Error(
                `Required config field ${chalk.bold(
                    field
                )} not found in d2.config.js or package.json`
            )
        }
    })
    return true
}

const parseConfigObjects = (
    config = {},
    pkg = {},
    { defaultsLib, defaultsApp, defaultsPWA } = {}
) => {
    const type = config.type || 'app'
    reporter.debug(`Type identified : ${chalk.bold(type)}`)

    const defaults = type === 'lib' ? defaultsLib : defaultsApp
    config = defaultsDeep(config, defaults)

    // Add PWA defaults to apps
    if (type === 'app') {
        config = defaultsDeep(config, defaultsPWA)
    }

    config.name = config.name || pkg.name
    config.version = config.version || pkg.version
    config.author = parseAuthor(config.author || pkg.author)
    if (config.author && !config.author.name) {
        throw new Error('If author is specified, it must include a valid name')
    }
    config.description = config.description || pkg.description
    config.title = config.title || config.name

    reporter.debug('config loaded', config)

    return config
}

const parseConfig = (paths) => {
    try {
        let config
        let pkg

        if (fs.existsSync(paths.config)) {
            reporter.debug('Loading d2 config at', paths.config)
            config = require(paths.config)
            reporter.debug('loaded', config)
        }
        if (fs.existsSync(paths.package)) {
            pkg = fs.readJsonSync(paths.package)
        }

        const parsedConfig = parseConfigObjects(config, pkg, {
            defaultsLib: require(paths.configDefaultsLib),
            defaultsApp: require(paths.configDefaultsApp),
            defaultsPWA: require(paths.configDefaultsPWA),
        })

        validateConfig(parsedConfig)

        return parsedConfig
    } catch (e) {
        reporter.error('Failed to load d2 config!')
        reporter.error(e)
        process.exit(1)
    }
}

module.exports = parseConfig

module.exports.parseConfigObjects = parseConfigObjects
