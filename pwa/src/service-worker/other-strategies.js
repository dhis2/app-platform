import { Strategy } from 'workbox-strategies'

const versionRegex = /\?[tv]=[0-9a-z]+$/

const isLocalFile = (request) => {
    const appRoot = new URL('.', self.location.href).href
    return request.url.startsWith(appRoot)
}

/** Remove version tag on local files */
const getCacheKey = (request) => {
    const versionMatch = request.url.match(versionRegex)
    if (!isLocalFile(request) || !versionMatch) {
        // don't need to handle this request
        return request
    }
    // else return unversioned url
    return request.url.substring(0, versionMatch.index)
}

/**
 * During development, the Vite server can end up creating a lot of
 * requests that add to the cache more and more, since assets get new
 * version hashes:
 * Each time the server restarts, dependencies get a new '?v=<version-hash>'
 * param added to the URL and a new cache entry for it.
 * Each time a source file is hot-updated, that file gets a new cache entry
 * with a '?t=<timestamp>' param added to the URL.
 *
 * If, after fetching, we cache these requests using the URL _without_ the
 * version tag as a key, we save adding lots of duplicate entries to the cache
 * while still caching the latest version of the file.
 *
 * This also avoids a niche but crash-causing bug for PWA apps in development
 * that happens after editing files locally to trigger HMR updates, then going
 * offline and reloading the app
 */
export class DevNetworkFirst extends Strategy {
    async _handle(request, handler) {
        let error, response
        try {
            // Try to fetch over the network
            // -- include version params here
            response = await handler.fetch(request)
        } catch (fetchError) {
            error = fetchError
        }

        // Handle local files with version params added
        const cacheKey = getCacheKey(request)

        if (response && !error) {
            // Successful -- try to cache
            // Note: handler.cachePut doesn't cache 400+ & 500+ responses,
            // but they will get get returned to the browser below
            // for the client to handle
            await handler.cachePut(cacheKey, response.clone())
        } else {
            // Unsuccessful -- try cache for response to return
            response = await handler.cacheMatch(cacheKey)
        }

        return response
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
