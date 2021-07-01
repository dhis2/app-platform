/**
 * If `config.type` === `app` and PWA is enabled, returns an object of env vars
 * to be used for PWA setup.
 * See also `/config/d2.pwa.config.js`.
 * @param {Object} config
 */
function getPWAEnvVars(config) {
    if (config.type !== 'app' || !config.pwa.enabled) return null
    return {
        pwa_enabled: JSON.stringify(config.pwa.enabled),
        omit_external_requests: JSON.stringify(
            config.pwa.caching.omitExternalRequests
        ),
        patterns_to_omit: JSON.stringify(config.pwa.caching.patternsToOmit),
    }
}

module.exports = getPWAEnvVars
