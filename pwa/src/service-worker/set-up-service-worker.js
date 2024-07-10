import { precacheAndRoute, matchPrecache, precache } from 'workbox-precaching'
import { registerRoute, setDefaultHandler } from 'workbox-routing'
import {
    NetworkFirst,
    NetworkOnly,
    StaleWhileRevalidate,
    Strategy,
} from 'workbox-strategies'
import { swMsgs } from '../lib/constants.js'
import {
    broadcastDhis2ConnectionStatus,
    dhis2ConnectionStatusPlugin,
    initDhis2ConnectionStatus,
} from './dhis2-connection-status'
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
        const indexUrl = process.env.PUBLIC_URL + '/index.html'
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

    // Network-first caching by default
    // * NOTE: there may be lazy-loading errors while offline in dev mode
    registerRoute(
        ({ url }) => urlMeetsAppShellCachingCriteria(url) && PRODUCTION_ENV,
        new NetworkFirst({
            cacheName: 'app-shell',
            plugins: [dhis2ConnectionStatusPlugin],
        })
    )

    /**
     * During development, the Vite server can end up creating a lot of
     * requests that add to the cache more and more, since assets get new
     * version hashes:
     * Each time the server restarts, dependencies get a new
     * '?v=<version-hash>' param added to the URL and a new cache entry for it
     * Each time a file is hot-updated, that file gets a new cache entry with a
     * '?t=<timestamp>' param added to the URL
     *
     * To avoid caching a lot of things unnecessarily, clean out local files if
     * new ones are added with a 'v=' or 't=' param
     *
     * Examples:
     * /src/D2App/components/VisualizationsList.jsx
     * /src/D2App/components/VisualizationsList.jsx?t=1720458237569
     * /src/D2App/components/VisualizationsList.jsx?t=1720458241654
     * /node_modules/.vite/deps/@dhis2_ui.js?v=70f7ac65
     * /node_modules/.vite/deps/@dhis2_ui.js?v=82fc8238
     */
    class DevNetworkFirst extends Strategy {
        async _handle(request, handler) {
            let error, response
            try {
                // Try to fetch over the network
                response = await handler.fetch(request)
            } catch (fetchError) {
                error = fetchError
            }

            if (!response || error) {
                // try cache for response to return
                response = await handler.cacheMatch(request)
            } else if (response.ok) {
                // If successful, clear similar requests w/ different versions
                await this._cacheBust(request).catch((e) => console.error(e))
                // and then cache
                await handler.cachePut(request, response.clone())
            }

            // Note: 400+ & 500+ responses won't get cached,
            // but they will get get returned to the browser
            return response
        }

        async _cacheBust(request) {
            const versionRegex = /\?[tv]=[0-9a-z]+$/
            const { url } = request
            const appRoot = new URL('.', self.location.href).href

            if (!url.startsWith(appRoot) || !versionRegex.test(url)) {
                return
            }

            const cache = await self.caches.open(this.cacheName)
            // get all cache entries with the same URL, ignoring query params
            const keys = await cache.keys(request, { ignoreSearch: true })
            const filteredKeys = keys.filter((req) => req.url !== url)
            if (filteredKeys.length > 0) {
                return cache.delete(request, { ignoreSearch: true })
            }
        }
    }

    registerRoute(
        ({ url }) => urlMeetsAppShellCachingCriteria(url),
        new DevNetworkFirst({
            cacheName: 'app-shell-dev-[todo:appname]',
            plugins: [dhis2ConnectionStatusPlugin],
        })
    )

    // Strategy for all other requests: try cache if network fails,
    // but don't add anything to cache
    class NetworkAndTryCache extends Strategy {
        _handle(request, handler) {
            return handler.fetch(request).catch((fetchErr) => {
                // use caches.match here because it matches all caches;
                // handler.cacheMatch only checks one
                return caches.match(request).then((res) => {
                    // If not found in cache, throw original fetchErr
                    // (if there's a cache err, that will be returned)
                    if (!res) {
                        throw fetchErr
                    }
                    return res
                })
            })
        }
    }
    // Use fallback strategy as default
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
