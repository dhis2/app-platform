import { swMsgs } from '../lib/constants.js'
import {
    deleteSectionsDB,
    openSectionsDB,
    SECTIONS_STORE,
} from '../lib/sections-db.js'

const CACHE_KEEP_LIST = [
    'other-assets',
    'app-shell',
    'app-shell-dev-[todo:appname]', // todo
]
const APP_ADAPTER_URL_PATTERNS = [
    /\/api(\/\d+)?\/system\/info/, // from ServerVersionProvider
    /\/api(\/\d+)?\/userSettings/, // useLocale
    /\/api(\/\d+)?\/me\?fields=id$/, // useVerifyLatestUser
]

// '[]' Fallback prevents error when switching from pwa enabled to disabled
const APP_SHELL_URL_FILTER_PATTERNS = JSON.parse(
    process.env
        .REACT_APP_DHIS2_APP_PWA_CACHING_PATTERNS_TO_OMIT_FROM_APP_SHELL ||
        // A deprecated fallback option:
        process.env.REACT_APP_DHIS2_APP_PWA_CACHING_PATTERNS_TO_OMIT ||
        '[]'
).map((pattern) => new RegExp(pattern))
const OMIT_EXTERNAL_REQUESTS_FROM_APP_SHELL =
    process.env
        .REACT_APP_DHIS2_APP_PWA_CACHING_OMIT_EXTERNAL_REQUESTS_FROM_APP_SHELL ===
        'true' ||
    // Deprecated option:
    process.env.REACT_APP_DHIS2_APP_PWA_CACHING_OMIT_EXTERNAL_REQUESTS ===
        'true'

/** Called if the `pwaEnabled` env var is not `true` */
export function setUpKillSwitchServiceWorker() {
    // A simple, no-op service worker that takes immediate control and tears
    // everything down. Has no fetch handler.
    self.addEventListener('install', () => {
        self.skipWaiting()
    })

    self.addEventListener('activate', async () => {
        console.log('Removing previous service worker')
        // Unregister, in case app doesn't
        self.registration.unregister()
        // Delete all caches
        const keys = await self.caches.keys()
        await Promise.all(keys.map((key) => self.caches.delete(key)))
        // Delete DB
        await deleteSectionsDB()
        // Force refresh all windows
        const clients = await self.clients.matchAll({ type: 'window' })
        clients.forEach((client) => client.navigate(client.url))
    })
}

export function urlMeetsAppShellCachingCriteria(url) {
    // If this request is for a file that belongs to this app, cache it
    // (in production, many, but not all, app files will be precached -
    // e.g. moment-locales is omitted)
    const appScope = new URL('./', self.location.href)
    if (url.href.startsWith(appScope.href)) {
        return true
    }

    // Cache this request if it is important for the app adapter to load
    const isAdapterRequest = APP_ADAPTER_URL_PATTERNS.some((pattern) =>
        pattern.test(url.href)
    )
    if (isAdapterRequest) {
        return true
    }

    // Don't cache if pwa.caching.omitExternalRequests in d2.config is true
    if (
        OMIT_EXTERNAL_REQUESTS_FROM_APP_SHELL &&
        url.origin !== self.location.origin
    ) {
        return false
    }

    // Don't cache if url matches filter in pattern list from d2.config.js
    const urlMatchesFilter = APP_SHELL_URL_FILTER_PATTERNS.some((pattern) =>
        pattern.test(url.href)
    )
    if (urlMatchesFilter) {
        return false
    }

    return true
}

/** Called upon SW activation */
export function createDB() {
    const dbPromise = openSectionsDB()
    self.dbPromise = dbPromise
    return dbPromise
}

/** Called upon SW activation */
export async function removeUnusedCaches() {
    const cacheKeys = await caches.keys()
    return Promise.all(
        cacheKeys.map(async (key) => {
            const isWorkboxKey = /workbox/.test(key)
            const isInKeepList = !!CACHE_KEEP_LIST.find(
                (keepKey) => keepKey === key
            )
            const db = await self.dbPromise
            const isASavedSection = !!(await db.get(SECTIONS_STORE, key))
            if (!isWorkboxKey && !isInKeepList && !isASavedSection) {
                console.debug(
                    `[SW] Cache with key ${key} is unused and will be deleted`
                )
                return caches.delete(key)
            }
        })
    )
}

/** Get all clients including uncontrolled, but only those within SW scope */
export function getAllClientsInScope() {
    // Include uncontrolled clients: necessary to know if there are multiple
    // tabs open upon first SW installation
    return self.clients
        .matchAll({
            includeUncontrolled: true,
        })
        .then((clientsList) =>
            // Filter to just clients within this SW scope, because other clients
            // on this domain but outside of SW scope are returned otherwise
            clientsList.filter((client) =>
                client.url.startsWith(self.registration.scope)
            )
        )
}

/**
 * Can be used to access information about this service worker's clients.
 * Sends back information on a message with 'CLIENTS_INFO' type; the payload
 * currently contains the number of current clients, including uncontrolled.
 * @returns {Object} { clientsCounts: number }
 */
export async function getClientsInfo(event) {
    const clientId = event.source.id

    const clientsList = await getAllClientsInScope()

    self.clients.get(clientId).then((client) => {
        client.postMessage({
            type: swMsgs.clientsInfo,
            payload: {
                clientsCount: clientsList.length,
            },
        })
    })
}

/**
 * Can be used upon first SW activation to give the newly installed SW control
 * of all open tabs (and then reload to use PWA app assets)
 */
export async function claimClients() {
    // The new SW will be active but not controlling any tabs.
    // clients.claim() gives the SW control of those tabs.
    self.clients.claim()
    // Important to use includeUncontrolled option here:
    const clients = await self.clients.matchAll({ includeUncontrolled: true })
    clients.forEach((client) => client.navigate(client.url))
}
