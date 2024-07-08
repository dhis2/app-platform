const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const { defaultsDeep, cloneDeep, has, isPlainObject } = require('lodash')
const parseAuthorString = require('parse-author')

const requiredConfigFields = {
    app: ['name', 'version', 'title'],
    login_app: ['name', 'version', 'title', 'entryPoints.app'],
    lib: ['name', 'version', 'entryPoints.lib'],
}

const appTypes = ['app', 'login_app']

const isApp = (type) => appTypes.includes(type)

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

    const { pluginType } = config
    if (pluginType && !/^[A-Z0-9-_]+$/.test(pluginType)) {
        throw new Error(
            `Field ${chalk.bold(
                'pluginType'
            )} must contain only the characters A-Z (uppercase), 0-9, -, or _. Got: ${chalk.bold(
                `"${pluginType}"`
            )}`
        )
    }

    // entrypoints are validated in compiler/entrypoints.js
    // authorities and datastore namespaces are validated in generateManifests.js

    return true
}

const parseConfigObjects = (
    config = {},
    pkg = {},
    { defaultsLib, defaultsApp, defaultsPWA } = {}
) => {
    if (!config.type) {
        // default value if undefined
        config.type = 'app'
    }
    const { type } = config
    reporter.debug(`Type identified : ${chalk.bold(type)}`)

    const defaults = type === 'lib' ? defaultsLib : defaultsApp
    // Apply default entrypoints if none are defined
    // (If an 'app'-type project has a plugin entry, don't add an app entry)
    if (!config.entryPoints || Object.keys(config.entryPoints).length === 0) {
        config.entryPoints = defaultsDeep(
            config.entryPoints,
            defaults?.entryPoints
        )
    }

    // Add PWA defaults to apps
    // todo: reconsider this -- it clutters the ENV passed to the app
    if (isApp(type)) {
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
            const importedConfig = require(paths.config)
            // Make sure not to overwrite imported object
            // (need to use it later in generateManifest)
            config = cloneDeep(importedConfig)
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
module.exports.isApp = isApp
