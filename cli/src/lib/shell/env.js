const { reporter } = require('@dhis2/cli-helpers-engine')

const defaultShellPort = 3000
const getShellPort = () => process.env.PORT || defaultShellPort

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

const makeShellEnv = vars =>
    Object.entries(vars).reduce(
        (out, [key, value]) => ({
            ...out,
            [`DHIS2_APP_${key.toUpperCase()}`]: value,
        }),
        {}
    )

module.exports = vars => {
    const env = {
        ...prefixEnvForCRA({
            ...filterEnv(),
            ...makeShellEnv(vars),
        }),
        PORT: getShellPort(),
        PUBLIC_URL: process.env.PUBLIC_URL,
    }

    reporter.debug('Env passed to app-shell:', env)
    return env
}
module.exports.defaultShellPort = defaultShellPort
module.exports.getShellPort = getShellPort
