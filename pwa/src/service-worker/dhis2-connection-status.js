import { getBaseUrlByAppName } from '../lib/base-url-db.js'
import { swMsgs } from '../lib/constants.js'
import { getAllClientsInScope } from './utils.js'

/**
 * Tracks connection to the DHIS2 server based on fetch successes or failures.
 * Starts as null because it can't be determined until a request is sent
 */
export function initDhis2ConnectionStatus() {
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

export async function updateDhis2ConnectionStatus(isConnected) {
    // todo: remove
    console.log('in update', {
        isConnected: isConnected,
        oldIsConnectedToDhis2: self.isConnectedToDhis2,
    })

    const clients = await getAllClientsInScope()
    clients.forEach((client) =>
        client.postMessage({
            type: swMsgs.dhis2ConnectionStatusUpdate,
            payload: { isConnectedToDhis2: isConnected },
        })
    )
}

async function isRequestToDhis2Server(request) {
    // If dhis2BaseUrl isn't set, try getting it from IDB
    if (!self.dhis2BaseUrl) {
        const baseUrl = await getBaseUrlByAppName(
            process.env.REACT_APP_DHIS2_APP_NAME
        )
        if (!baseUrl) {
            // No base URL is set; as a best effort, go ahead and update status
            // based on this request, even though it might not be to the DHIS2 server
            return true
        } else {
            self.dhis2BaseUrl = baseUrl
        }
    }

    return request.url.startsWith(self.dhis2BaseUrl)
}

/**
 * A plugin to hook into lifecycle events in workbox strategies
 * https://developer.chrome.com/docs/workbox/using-plugins/
 */
export const dhis2ConnectionStatusPlugin = {
    // todo: remove console logs
    fetchDidFail: async ({ request, error }) => {
        console.log('fetch did FAIL', {
            request,
            error,
            baseUrl: self.dhis2BaseUrl,
        })

        if (await isRequestToDhis2Server(request)) {
            updateDhis2ConnectionStatus(false)
        }
    },
    fetchDidSucceed: async ({ request, response }) => {
        console.log('fetch did SUCCEED', {
            request,
            response,
            baseUrl: self.dhis2BaseUrl,
            env: process.env,
        })

        if (await isRequestToDhis2Server(request)) {
            updateDhis2ConnectionStatus(true)
        }
        return response
    },
}
