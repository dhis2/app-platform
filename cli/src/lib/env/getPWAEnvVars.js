const { isApp } = require('../parseConfig')

/** Preps string literals for regex conversion by escaping special chars */
function escapeForRegex(string) {
    return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
}

/**
 * Handles patterns defined as strings or RegExps and stringifies the array
 * for passing as an env var. Note that all patterns will be converted to
 * Regexes in the service worker.
 * @param {Object} config
 */
function stringifyPatterns(patternsList) {
    if (patternsList === undefined) {
        return undefined
    }
    const stringsList = patternsList.map((pattern) => {
        if (typeof pattern === 'string') {
            return escapeForRegex(pattern)
        } else if (pattern instanceof RegExp) {
            return pattern.source
        } else {
            throw new Error(
                `Pattern ${pattern} to omit must be either a RegExp or a string`
            )
        }
    })
    return JSON.stringify(stringsList)
}

/**
 * If `config.type` === `app` and PWA is enabled, returns an object of env vars
 * to be used for PWA setup.
 * See also `/config/d2ConfigDefaults.js`.
 * @param {Object} config
 */
function getPWAEnvVars(config) {
    if (!isApp(config.type)) {
        return null
    }
    if (!config.pwa?.enabled) {
        // Explicitly adding this value to the env helps pare down code in
        // non-PWA apps when doing static bundle analysis
        return { pwa_enabled: 'false' }
    }
    return {
        pwa_enabled: 'true',
        pwa_caching_omit_external_requests_from_app_shell: config.pwa?.caching
            ?.omitExternalRequestsFromAppShell
            ? 'true'
            : undefined,
        // Deprecated version of the above:
        pwa_caching_omit_external_requests: config.pwa?.caching
            ?.omitExternalRequests
            ? 'true'
            : undefined,
        pwa_caching_patterns_to_omit_from_app_shell: stringifyPatterns(
            config.pwa?.caching?.patternsToOmitFromAppShell
        ),
        // Deprecated version of the above:
        pwa_caching_patterns_to_omit: stringifyPatterns(
            config.pwa?.caching?.patternsToOmit
        ),
        pwa_caching_patterns_to_omit_from_cacheable_sections: stringifyPatterns(
            config.pwa?.caching?.patternsToOmitFromCacheableSections
        ),
    }
}

module.exports = getPWAEnvVars
