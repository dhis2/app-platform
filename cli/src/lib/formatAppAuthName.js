const { formatUrlSafeAppSlug } = require('./constructAppUrl')

const APP_AUTH_PREFIX = 'M_'
const DHIS_WEB = 'dhis-web-'

/**
 * Returns the string that identifies the 'App view permission'
 * required to view the app
 *
 * Ex: coreApp && name = 'data-visualizer': authName = 'M_dhis-web-data-visualizer'
 * Ex: name = 'pwa-example': authName = 'M_pwaexample'
 * Ex: name = 'BNA Action Tracker': authName = 'M_BNA_Action_Tracker'
 *
 * The 'legacy' parameter specifies server version < 2.35 which uses
 * config.title instead of config.name
 */
const formatAppAuthName = ({ config, legacy }) => {
    const appName = legacy ? config.title : config.name

    if (config.coreApp) {
        return APP_AUTH_PREFIX + DHIS_WEB + formatUrlSafeAppSlug(appName)
    }

    // This formatting is drawn from https://github.com/dhis2/dhis2-core/blob/master/dhis-2/dhis-api/src/main/java/org/hisp/dhis/appmanager/App.java#L494-L499
    // (replaceAll is only introduced in Node 15)
    return (
        APP_AUTH_PREFIX +
        appName
            .trim()
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s/g, '_')
    )
}

module.exports = formatAppAuthName
