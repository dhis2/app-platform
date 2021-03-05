export const parseRollupEnvironment = environment => {
    if (Array.isArray(environment)) {
        return environment
            .map(parseRollupEnvironment)
            .reduce((out, env) => ({ ...out, ...env }), {})
    }
    if (typeof environment === 'object') {
        return environment
    }

    const env = {}

    if (typeof environment === 'string') {
        const envVars = environment.split(',')
        envVars.forEach(envVar => {
            const [key, value] = envVar.split(':')
            if (typeof value === 'undefined') {
                env[key] = true
            } else {
                env[key] = value
            }
        })
    }

    return env
}
