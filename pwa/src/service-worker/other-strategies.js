import { Strategy } from 'workbox-strategies'

const versionRegex = /\?[tv]=[0-9a-z]+$/

/**
 * During development, the Vite server can end up creating a lot of
 * requests that add to the cache more and more, since assets get new
 * version hashes:
 * Each time the server restarts, dependencies get a new
 * '?v=<version-hash>' param added to the URL and a new cache entry for it.
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
export class DevNetworkFirst extends Strategy {
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

/**
 * Strategy for all other requests: try cache if network fails,
 * but don't add anything to cache
 */
export class NetworkAndTryCache extends Strategy {
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
