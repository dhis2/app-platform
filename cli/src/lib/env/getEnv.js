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

const getShellEnv = (config) => {
    const shellEnv = {
        name: config.title,
        version: config.version,
        loginApp: config.type === 'login_app' || undefined,
        direction: config.direction,
        // NB: 'IS_PLUGIN' is added by string replacement in
        // compiler/entrypoints.js, since env is shared between app and plugin
        requiredProps: config.requiredProps?.join(),
        skipPluginLogic: config.skipPluginLogic,
        ...getPWAEnvVars(config),
    }

    // Remove undefined values and prefix with DHIS2_APP_
    const filteredAndPrefixedShellEnv = Object.entries(shellEnv).reduce(
        (newEnv, [key, value]) => {
            if (typeof value === 'undefined') {
                return newEnv
            }
            return {
                ...newEnv,
                [`DHIS2_APP_${key.toUpperCase()}`]: value,
            }
        },
        {}
    )
    return filteredAndPrefixedShellEnv
}

module.exports = ({ config, baseUrl, publicUrl }) => {
    const filteredEnv = filterEnv()
    const shellEnv = getShellEnv(config)
    const DHIS2_BASE_URL = baseUrl

    const env = {
        // Legacy env vars; deprecated
        ...prefixEnvForCRA({
            DHIS2_BASE_URL,
            ...filteredEnv,
            ...shellEnv,
        }),
        // New form for env vars: import.meta.env.DHIS2_etc
        ...filteredEnv,
        ...shellEnv,
        NODE_ENV: process.env.NODE_ENV,
        DHIS2_BASE_URL,
        // todo: deprecated; migrate to import.meta.env.BASE_URL
        PUBLIC_URL: publicUrl || '.',
    }

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
