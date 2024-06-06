const { reporter } = require('@dhis2/cli-helpers-engine')

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

const prefixEnvForCRA = (env) =>
    Object.keys(env).reduce(
        (out, key) => ({
            ...out,
            [`REACT_APP_${key}`]: env[key],
        }),
        {}
    )

const makeShellEnv = (vars) =>
    Object.entries(vars).reduce(
        (out, [key, value]) => ({
            ...out,
            [`DHIS2_APP_${key.toUpperCase()}`]: value,
        }),
        {}
    )

module.exports = ({ port, ...vars }) => {
    const env = {
        ...prefixEnvForCRA({
            ...filterEnv(),
            ...makeShellEnv(vars),
        }),
        ...filterEnv(),
        ...makeShellEnv(vars),
        PORT: port,
        PUBLIC_URL: process.env.PUBLIC_URL,
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
