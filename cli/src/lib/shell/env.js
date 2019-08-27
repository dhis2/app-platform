const { reporter } = require('@dhis2/cli-helpers-engine')

const filterEnv = () =>
    Object.keys(process.env)
        .filter(key => key.indexOf('DHIS2_') === 0)
        .reduce(
            (out, key) => ({
                ...out,
                [key]: process.env[key],
            }),
            {}
        )

const prefixEnvForCRA = env =>
    Object.keys(env).reduce(
        (out, key) => ({
            ...out,
            [`REACT_APP_${key}`]: env[key],
        }),
        {}
    )

const getDHISConfig = () => {
    const dhisConfigPath =
        process.env.DHIS2_HOME && `${process.env.DHIS2_HOME}/config`

    let dhisConfig
    try {
        dhisConfig = require(dhisConfigPath)
    } catch (e) {
        // Failed to load config file - use default config
        reporter.debug(`\nWARNING! Failed to load DHIS config:`, e.message)
        dhisConfig = {
            baseUrl: 'http://localhost:8080',
            authorization: 'Basic YWRtaW46ZGlzdHJpY3Q=', // admin:district
        }
    }

    return dhisConfig
}

const envFromDHISConfig = config => ({
    DHIS2_BASE_URL: config.baseUrl,
    DHIS2_AUTHORIZATION: config.authorization,
})

const makeShellEnv = vars =>
    Object.entries(vars).reduce(
        (out, [key, value]) => ({
            ...out,
            [`DHIS2_APP_${key.toUpperCase()}`]: value,
        }),
        {}
    )

module.exports = vars => {
    const env = prefixEnvForCRA({
        ...envFromDHISConfig(getDHISConfig()),
        ...filterEnv(),
        ...makeShellEnv(vars),
    })
    reporter.debug('Env passed to app-shell:', env)
    return env
}
