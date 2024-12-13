module.exports.constructAppUrl = ({
    baseUrl,
    config,
    serverVersion,
    plugin,
}) => {
    let appUrl = baseUrl

    const isModernServer = serverVersion.major >= 2 && serverVersion.minor >= 35

    // From core version 2.35, short_name is used instead of the human-readable title to generate the url slug
    const urlSafeAppSlug = (isModernServer ? config.name : config.title)
        .replace(/[^A-Za-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')

    // From core version 2.35, core apps are hosted at the server root under the /dhis-web-* namespace
    if (config.coreApp && isModernServer) {
        appUrl += `/dhis-web-${urlSafeAppSlug}/`
    } else {
        appUrl += `/api/apps/${urlSafeAppSlug}/`
    }

    // Prior to core version 2.35, installed applications did not properly serve "pretty" urls (`/` vs `/index.html`)
    if (!isModernServer) {
        appUrl += 'index.html'
    } else if (plugin) {
        // (this and isModernServer should be mutually exclusive conditions)
        appUrl += 'plugin.html'
    }

    // Clean up any double slashes
    const scheme = appUrl.substr(0, appUrl.indexOf('://') + 3)
    appUrl = scheme + appUrl.substr(scheme.length).replace(/\/+/g, '/')
    return appUrl
}
