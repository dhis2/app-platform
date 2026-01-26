const { reporter } = require('@dhis2/cli-helpers-engine')
const getPWAEnvVars = require('./getPWAEnvVars')

/**
 * Filter process.env for just keys that start with DHIS2_
 * to avoid leaking env
 */
const filterEnv = () =>
    Object.keys(process.env)
        .filter((key) => key.indexOf('DHIS2_') === 0)
        .reduce(
            (out, key) => ({
                ...out,
                [key]: process.env[key],
            }),
            {}
        )

/**
 * Deprecated -- CRA did its own filtering;
 * only env vars prefixed with REACT_APP_ would get passed to the app
 */
const prefixEnvForCRA = (env) =>
    Object.keys(env).reduce(
        (out, key) => ({
            ...out,
            [`REACT_APP_${key}`]: env[key],
        }),
        {}
    )

/** Set up variables relevant to the App Shell */
const getShellEnv = (config) => {
    const shellEnv = {
        name: config.title,
        // Added after 'name' key was already taken by the above (config.title):
        url_slug: config.name,
        // Currently an alias for 'name', but can be used to switch 'name'
        // to config.name (it would be nice for these to match d2 config)
        title: config.title,
        version: config.version,
        loginApp: config.type === 'login_app' ? 'true' : undefined,
        direction: config.direction,
        requiredProps: config.requiredProps?.join(),
        skipPluginLogic: config.skipPluginLogic ? 'true' : undefined,
        ...getPWAEnvVars(config),
        // NB: 'IS_PLUGIN' is added by string replacement in
        // compiler/entrypoints.js, since env is shared between app and plugin
    }

    // Prefix with DHIS2_APP_
    const prefixedShellEnv = Object.entries(shellEnv).reduce(
        (newEnv, [key, value]) => {
            return {
                ...newEnv,
                [`DHIS2_APP_${key.toUpperCase()}`]: value,
            }
        },
        {}
    )
    return prefixedShellEnv
}

/**
 * 1. Removes keys with `undefined` values to avoid noise
 * 2. Double-checks to make sure all values are strings
 */
const cleanEntries = (env) => {
    return Object.entries(env).reduce((newEnv, [key, value]) => {
        if (value === undefined) {
            return newEnv
        }
        return {
            ...newEnv,
            [key]: typeof value === 'string' ? value : JSON.stringify(value),
        }
    }, {})
}

module.exports = ({ config, baseUrl, publicUrl }) => {
    const filteredEnv = filterEnv()
    const shellEnv = getShellEnv(config)
    const DHIS2_BASE_URL = baseUrl

    const env = cleanEntries({
        // Legacy env var prefix; deprecated
        ...prefixEnvForCRA({
            DHIS2_BASE_URL,
            ...filteredEnv,
            ...shellEnv,
        }),
        // New keys for env vars: process.env.DHIS2_etc
        ...filteredEnv,
        ...shellEnv,
        DHIS2_BASE_URL,
        NODE_ENV: process.env.NODE_ENV,
        PUBLIC_URL: publicUrl || '.',
    })

    if (env.REACT_APP_DHIS2_API_VERSION) {
        reporter.warn(
            'Passing an explicit API version to the DHIS2 App Platform is not recommended.\n' +
                'By default, the app platform will now use the latest API version available in the DHIS2 instance.\n' +
                'Some API functionality may be unreliable when using an explicit API version.\n' +
                'Support for the DHIS2_API_VERSION environment variable may be removed in a future release of the DHIS2 App Platform.'
        )
    }

    reporter.debug('Env passed to app-shell:', env)
    return env
}
