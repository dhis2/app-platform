const isUrlAbsolute = (url) => {
    // the URL constructor will throw for relative URLs
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

/**
 * Deduces the base URL for the DHIS2 instance from the location at which this
 * app is hosted. Returns an absolute URL
 * @param {string} defaultBaseUrl a fallback URL that will be used if the base
 * URL can't be deduced from the window location
 * @returns {string} an absolute base URL for the DHIS2 instance
 */
export const getBaseUrl = (defaultBaseUrl) => {
    // if defaultBaseUrl is absolute, use that
    if (isUrlAbsolute(defaultBaseUrl)) {
        return defaultBaseUrl
    }

    const { location } = window
    const path = location.pathname

    // get penultimate 3 path elements (don't need anything before),
    // e.g. /dev/api/apps/app-name/index.html => ['api', 'apps', 'app-name'].
    const splitPath = path.split('/').slice(-4, -1)
    // could be shorter than 3 elements for e.g. /dhis-web-maps/
    const l = splitPath.length

    // test for core apps
    if (/dhis-web-.+/.test(splitPath[l - 1])) {
        return new URL('..', location.href).href
    }

    // test for custom apps
    if (splitPath[l - 3] === 'api' && splitPath[l - 2] === 'apps') {
        return new URL('../../..', location.href).href
    }

    // todo: handle path for global shell

    // otherwise, return absolute version of default
    return new URL(defaultBaseUrl, location.href).href
}
