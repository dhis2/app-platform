const APP_AUTH_PREFIX = 'M_'
const DHIS_WEB = 'dhis-web-'

/**
 * Returns the string that identifies the 'App view permission'
 * required to view the app
 *
 * Ex: coreApp && name = 'data-visualizer': authName = 'M_dhis-web-data-visualizer'
 * Ex: name = 'pwa-example': authName = 'M_pwaexample'
 * Ex: name = 'BNA Action Tracker': authName = 'M_BNA_Action_Tracker'
 */
const formatAppAuthName = (config) => {
    if (config.coreApp) {
        // TODO: Verify this formatting - are there any transformations,
        // or do we trust that it's lower-case and hyphenated?
        return APP_AUTH_PREFIX + DHIS_WEB + config.name
    }

    // This formatting is drawn from https://github.com/dhis2/dhis2-core/blob/master/dhis-2/dhis-api/src/main/java/org/hisp/dhis/appmanager/App.java#L494-L499
    // (replaceAll is only introduced in Node 15)
    return (
        APP_AUTH_PREFIX +
        config.name
            .trim()
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s/g, '_')
    )
}

module.exports = formatAppAuthName
