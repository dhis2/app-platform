import { getBaseUrlByAppName } from '../lib/base-url-db.js'
import { swMsgs } from '../lib/constants.js'

/**
 * Tracks connection to the DHIS2 server based on fetch successes or failures.
 * Starts as null because it can't be determined until a request is sent
 */
export function initOnlineStatus() {
    self.isOnline = null

    // base url is only set as an env var in production.
    // in dev/standalone env, this may be undefined,
    // and the base URL can be accessed from IDB later.
    // note: if this SW is part of a global shell,
    // URL would need to be found on a per-client basis
    const dhis2BaseUrl = process.env.REACT_APP_DHIS2_BASE_URL
    if (dhis2BaseUrl) {
        try {
            self.dhis2BaseUrl = new URL(dhis2BaseUrl).href
        } catch {
            // the base URL is relative; construct an absolute one
            self.dhis2BaseUrl = new URL(dhis2BaseUrl, self.location.href).href
        }
    }
}

export async function updateOnlineStatus(isOnline) {
    // todo: remove
    console.log('in update', { isOnline, oldIsOnline: self.isOnline })

    // todo: avoid spamming duplicate status updates
    const hasOnlineStatusChanged = isOnline !== self.isOnline
    if (!hasOnlineStatusChanged) {
        // return
    }

    self.isOnline = isOnline

    const clients = await self.clients.matchAll({ type: 'window' })
    clients.forEach(client =>
        client.postMessage({
            type: swMsgs.onlineStatusUpdate,
            payload: { isOnline },
        })
    )
}

async function shouldUpdateOnlineStatus(request) {
    // If dhis2BaseUrl isn't set, try getting it from IDB
    if (!self.dhis2BaseUrl) {
        const baseUrl = await getBaseUrlByAppName(
            process.env.REACT_APP_DHIS2_APP_NAME
        )
        if (!baseUrl) {
            // No base URL is set; go ahead and update status based on this request
            // even though it might not be to the DHIS2 server
            return true
        } else {
            self.dhis2BaseUrl = baseUrl
        }
    }

    // assuming self.dhis2BaseUrl is an absolute url, update online status if
    // this request URL matches the DHIS2 server base URL
    return request.url.startsWith(self.dhis2BaseUrl)
}

/**
 * A plugin to hook into lifecycle events in workbox strategies
 * https://developer.chrome.com/docs/workbox/using-plugins/
 */
export const onlineStatusUpdatesPlugin = {
    // todo: remove console logs
    fetchDidFail: async ({ request, error }) => {
        console.log('fetch did FAIL', {
            request,
            error,
            baseUrl: self.dhis2BaseUrl,
        })

        if (await shouldUpdateOnlineStatus(request)) {
            updateOnlineStatus(false)
        }
    },
    fetchDidSucceed: async ({ request, response }) => {
        console.log('fetch did SUCCEED', {
            request,
            response,
            baseUrl: self.dhis2BaseUrl,
            env: process.env,
        })

        if (await shouldUpdateOnlineStatus(request)) {
            updateOnlineStatus(true)
        }
        return response
    },
}
