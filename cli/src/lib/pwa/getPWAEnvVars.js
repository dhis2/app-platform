/**
 * Handles patterns defined as strings or RegExps
 * @param {Object} config
 */
function getPatternsToOmit(config) {
    const patternsToOmit = config.pwa.caching.patternsToOmit.map(pattern => {
        if (typeof pattern === 'string') {
            return pattern
        } else if (pattern instanceof RegExp) {
            return pattern.source
        } else {
            throw new Error(
                `Pattern ${pattern} to omit must be either a RegExp or a string`
            )
        }
    })
    return JSON.stringify(patternsToOmit)
}

/**
 * If `config.type` === `app` and PWA is enabled, returns an object of env vars
 * to be used for PWA setup.
 * See also `/config/d2.pwa.config.js`.
 * @param {Object} config
 */
function getPWAEnvVars(config) {
    if (config.type !== 'app' || !config.pwa.enabled) {
        return null
    }
    return {
        pwa_enabled: JSON.stringify(config.pwa.enabled),
        pwa_caching_omit_external_requests: JSON.stringify(
            config.pwa.caching.omitExternalRequests
        ),
        pwa_caching_patterns_to_omit: getPatternsToOmit(config),
    }
}

module.exports = getPWAEnvVars
