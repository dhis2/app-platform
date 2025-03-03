import { precacheAndRoute, matchPrecache, precache } from 'workbox-precaching'
import { registerRoute, setDefaultHandler } from 'workbox-routing'
import {
    NetworkFirst,
    NetworkOnly,
    StaleWhileRevalidate,
} from 'workbox-strategies'
import { swMsgs } from '../lib/constants.js'
import {
    broadcastDhis2ConnectionStatus,
    dhis2ConnectionStatusPlugin,
    initDhis2ConnectionStatus,
} from './dhis2-connection-status'
import { DevNetworkFirst, NetworkAndTryCache } from './other-strategies.js'
import {
    startRecording,
    completeRecording,
    shouldRequestBeRecorded,
    initClientRecordingStates,
    RecordingMode,
} from './recording-mode.js'
import {
    urlMeetsAppShellCachingCriteria,
    createDB,
    removeUnusedCaches,
    setUpKillSwitchServiceWorker,
    getClientsInfo,
    claimClients,
} from './utils.js'

export function setUpServiceWorker() {
    const pwaEnabled = process.env.REACT_APP_DHIS2_APP_PWA_ENABLED === 'true'
    if (!pwaEnabled) {
        // Install 'killswitch' service worker and refresh page to clear
        // rogue service workers. App should then unregister SW
        setUpKillSwitchServiceWorker()
        return
    }

    // Misc setup

    // Disable verbose logs
    // TODO: control with env var
    self.__WB_DISABLE_DEV_LOGS = true

    // Globals (Note: global state resets each time SW goes idle)

    initClientRecordingStates()
    initDhis2ConnectionStatus()

    // Local constants

    const PRODUCTION_ENV = process.env.NODE_ENV === 'production'
    const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$')

    // Workbox routes

    // Only precache in production mode to enable easier app development.
    // In development, static assets are handled by 'network first' strategy
    // and will be kept up-to-date.
    if (PRODUCTION_ENV) {
        // Injection point for the precache manifest from workbox-build,
        // a manifest of app assets to fetch and cache upon SW installation
        const precacheManifest = self.__WB_MANIFEST || []

        // todo: also do this routing for plugin.html
        // Extract index.html from the manifest to precache, then route
        // in a custom way
        const indexHtmlManifestEntry = precacheManifest.find(({ url }) =>
            url.endsWith('index.html')
        )
        // Make sure that this request doesn't redirect to a global shell
        indexHtmlManifestEntry.url += '?redirect=false'
        precache([indexHtmlManifestEntry])

        // Custom strategy for handling app navigation, specifically to allow
        // navigations to redirect to the login page while online if the
        // user is unauthenticated. Fixes showing the app shell login dialog
        // in production if a user is online and unauthenticated.
        // Uses app-shell style routing to route navigations to index.html.
        const navigationRouteMatcher = ({ request, url }) => {
            // If this isn't a navigation, skip.
            if (request.mode !== 'navigate') {
                return false
            }

            // If this is a URL that starts with /_, skip.
            if (url.pathname.startsWith('/_')) {
                return false
            }

            // If this looks like a URL for a resource, because it contains
            // a file extension, skip (unless it's index.html)
            if (
                fileExtensionRegexp.test(url.pathname) &&
                !url.pathname.endsWith('index.html')
            ) {
                return false
            }

            // Return true to signal that we want to use the handler.
            return true
        }
        // Above, the index entry had the redirect param added:
        const indexUrl = process.env.PUBLIC_URL + '/index.html?redirect=false'
        const navigationRouteHandler = ({ request }) => {
            return fetch(request)
                .then((response) => {
                    if (response.type === 'opaqueredirect' || !response.ok) {
                        // It's sending a redirect to the login page,
                        // or an 'unauthorized'/'forbidden' response.
                        // Return that to the client
                        return response
                    }

                    // Otherwise return precached index.html
                    return matchPrecache(indexUrl)
                })
                .catch(() => {
                    // Request failed (probably offline). Return cached response
                    return matchPrecache(indexUrl)
                })
        }
        // NOTE: This route must come before any precacheAndRoute calls, since
        // precacheAndRoute creates routes for ALL previously precached files
        registerRoute(navigationRouteMatcher, navigationRouteHandler)

        // Handle the rest of files in the manifest - filter out index.html
        const restOfManifest = precacheManifest.filter(
            (e) => e !== indexHtmlManifestEntry
        )
        precacheAndRoute(restOfManifest)
    }

    // Handling pings: only use the network, and don't update the connection
    // status (let the runtime do that)
    // Two endpoints: /api(/version)/system/ping and /api/ping
    registerRoute(
        ({ url }) => /\/api(\/\d+)?(\/system)?\/ping/.test(url.pathname),
        new NetworkOnly()
    )

    // Request handler during recording mode: ALL requests are cached
    // Handling routing: https://developers.google.com/web/tools/workbox/modules/workbox-routing#matching_and_handling_in_routes
    registerRoute(
        shouldRequestBeRecorded,
        new RecordingMode({ plugins: [dhis2ConnectionStatusPlugin] })
    )

    // If not recording, fall through to default caching strategies for app
    // shell:
    // SWR strategy for image assets that can't be precached.
    // (Skip in development environments)
    registerRoute(
        ({ url }) =>
            PRODUCTION_ENV &&
            urlMeetsAppShellCachingCriteria(url) &&
            /\.(jpg|gif|png|bmp|tiff|ico|woff)$/.test(url.pathname),
        new StaleWhileRevalidate({
            cacheName: 'other-assets',
            plugins: [dhis2ConnectionStatusPlugin],
        })
    )

    // Network-first caching for everything else.
    // Uses a custom strategy in dev mode to avoid bloating cache
    // with file duplicates
    // * NOTE: there may be lazy-loading errors while offline in dev mode
    const ResolvedNetworkFirst = PRODUCTION_ENV ? NetworkFirst : DevNetworkFirst
    registerRoute(
        ({ url }) => urlMeetsAppShellCachingCriteria(url),
        new ResolvedNetworkFirst({
            cacheName: 'app-shell',
            plugins: [dhis2ConnectionStatusPlugin],
        })
    )

    // Fallback: try cache if network fails, but don't cache anything
    setDefaultHandler(
        new NetworkAndTryCache({ plugins: [dhis2ConnectionStatusPlugin] })
    )

    // Service Worker event handlers

    self.addEventListener('message', (event) => {
        if (!event.data) {
            return
        }

        if (event.data.type === swMsgs.getClientsInfo) {
            getClientsInfo(event)
        }

        // Can be used upon first SW activation
        if (event.data.type === swMsgs.claimClients) {
            claimClients()
        }

        // This allows the web app to trigger skipWaiting via
        // registration.waiting.postMessage({type: 'SKIP_WAITING'})
        if (event.data.type === swMsgs.skipWaiting) {
            self.skipWaiting()
        }

        // Immediately trigger this throttled function -- this allows the app
        // to get the value ASAP upon startup, which it otherwise usually
        // has to wait for
        if (
            event.data.type === swMsgs.getImmediateDhis2ConnectionStatusUpdate
        ) {
            broadcastDhis2ConnectionStatus.flush()
        }

        if (event.data.type === swMsgs.startRecording) {
            startRecording(event)
        }

        if (event.data.type === swMsgs.completeRecording) {
            completeRecording(event.source.id) // same as FetchEvent.clientId
        }
    })

    // Open DB on activation
    self.addEventListener('activate', (event) => {
        event.waitUntil(createDB().then(removeUnusedCaches))
    })
}
