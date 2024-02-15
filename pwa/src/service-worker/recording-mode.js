import { Strategy } from 'workbox-strategies'
import { swMsgs } from '../lib/constants.js'
import { openSectionsDB, SECTIONS_STORE } from '../lib/sections-db.js'

// '[]' Fallback prevents error when switching from pwa enabled to disabled
const CACHEABLE_SECTION_URL_FILTER_PATTERNS = JSON.parse(
    process.env
        .REACT_APP_DHIS2_APP_PWA_CACHING_PATTERNS_TO_OMIT_FROM_CACHEABLE_SECTIONS ||
        '[]'
).map((pattern) => new RegExp(pattern))

/**
 * Tracks recording states for multiple clients to handle multiple windows
 * recording simultaneously
 */
export function initClientRecordingStates() {
    self.clientRecordingStates = {}
}

// Triggered on 'START_RECORDING' message
export function startRecording(event) {
    console.debug('[SW] Starting recording')
    if (!event.data.payload?.sectionId) {
        throw new Error('[SW] No section ID specified to record')
    }

    const clientId = event.source.id // clientId from MessageEvent
    // Throw error if another recording is in process
    if (isClientRecording(clientId)) {
        throw new Error(
            "[SW] Can't start a new recording; a recording is already in process"
        )
    }

    const newClientRecordingState = {
        sectionId: event.data.payload?.sectionId,
        pendingRequests: new Set(),
        // `fulfilledRequests` can later hold useful data for normalization.
        // Until then, it's just a count
        fulfilledRequests: 0,
        recordingTimeout: undefined,
        recordingTimeoutDelay:
            event.data.payload?.recordingTimeoutDelay || 1000,
        confirmationTimeout: undefined,
    }
    self.clientRecordingStates[clientId] = newClientRecordingState

    // Send confirmation message to client
    self.clients.get(clientId).then((client) => {
        client.postMessage({ type: swMsgs.recordingStarted })
    })
}

/** Used to check if a new recording can begin */
function isClientRecording(clientId) {
    return clientId in self.clientRecordingStates
}

/**
 * A request-matching function for the recorded request route. If 'true' is
 * returned, the request will be handled by the handler below.
 */
export function shouldRequestBeRecorded({ url, event }) {
    const clientId = event.clientId
    // If not recording, don't handle
    if (!isClientRecording(clientId)) {
        return false
    }

    // Don't record requests when waiting for completion confirmation
    if (
        self.clientRecordingStates[clientId].confirmationTimeout !== undefined
    ) {
        return false
    }

    // Don't cache if url matches filter in pattern list from d2.config.js
    const urlMatchesFilter = CACHEABLE_SECTION_URL_FILTER_PATTERNS.some(
        (pattern) => pattern.test(url.href)
    )
    if (urlMatchesFilter) {
        return false
    }

    return true
}

/** Request handler during recording mode */
export class RecordingMode extends Strategy {
    _handle(request, handler) {
        const { event } = handler
        const recordingState = self.clientRecordingStates[event.clientId]

        clearTimeout(recordingState.recordingTimeout)
        recordingState.pendingRequests.add(request)

        return handler
            .fetch(request)
            .then((response) => {
                return handleRecordedResponse(request, response, event.clientId)
            })
            .catch((error) => {
                stopRecording(error, event.clientId)
                // trigger 'fetchDidFail' callback
                throw error
            })
    }
}

/** Response handler during recording mode */
function handleRecordedResponse(request, response, clientId) {
    const recordingState = self.clientRecordingStates[clientId]

    if (!recordingState) {
        // It's likely that the recording was stopped due to an error.
        // There will be plenty of error messages logged; no need for another
        // one here
        return response
    }

    // add response to temp cache - when recording is successful, move to permanent cache
    const tempCacheKey = getCacheKey('temp', clientId)
    addToCache(tempCacheKey, request, response)

    // normalizing data could happen here; until then, increment counter
    recordingState.fulfilledRequests += 1

    // remove request from pending requests
    recordingState.pendingRequests.delete(request)

    // start timer if pending requests are all complete
    if (recordingState.pendingRequests.size === 0) {
        startRecordingTimeout(clientId)
    }
    return response
}

/**
 * Starts a timer that stops recording when finished. The timer will
 * be cleared if a new request is handled and start again when there are
 * no more pending requests.
 */
function startRecordingTimeout(clientId) {
    const recordingState = self.clientRecordingStates[clientId]
    recordingState.recordingTimeout = setTimeout(
        () => stopRecording(null, clientId),
        recordingState.recordingTimeoutDelay
    )
}

/** Called on recording success or failure */
function stopRecording(error, clientId) {
    const recordingState = self.clientRecordingStates[clientId]

    if (recordingState) {
        console.debug('[SW] Stopping recording', { clientId, recordingState })
        clearTimeout(recordingState.recordingTimeout)
    }

    // In case of error, notify client and remove recording.
    // Post message even if !recordingState to ensure client stops.
    if (error) {
        self.clients.get(clientId).then((client) => {
            // use plain object instead of Error for firefox compatibility
            client.postMessage({
                type: swMsgs.recordingError,
                payload: {
                    msg: error.message,
                },
            })
        })
        removeRecording(clientId)
        return
    }

    // On success, prompt client to confirm saving recording
    requestCompletionConfirmation(clientId)
}

function getCacheKey(...args) {
    return args.join('-')
}

function addToCache(cacheKey, request, response) {
    if (response.ok) {
        const responseClone = response.clone()
        caches.open(cacheKey).then((cache) => cache.put(request, responseClone))
    }
}

function removeRecording(clientId) {
    // Remove recording state
    delete self.clientRecordingStates[clientId]
    // Delete temp cache
    const cacheKey = getCacheKey('temp', clientId)
    return caches.delete(cacheKey)
}

/**
 * To validate a completed recording, request an acknowledgement from
 * the client before finishing and saving the recording. This prevents
 * saving faulty recordings due to navigation or other problems and
 * avoids overwriting a good recording
 */
async function requestCompletionConfirmation(clientId) {
    const client = await self.clients.get(clientId)
    if (!client) {
        console.debug('[SW] Client not found for ID', clientId)
        removeRecording(clientId)
        return
    }
    client.postMessage({ type: swMsgs.confirmRecordingCompletion })
    startConfirmationTimeout(clientId)
}

/**
 * Wait 10 seconds for client acknowledgement to save recording. If timer
 * runs out, the recording is scrapped.
 */
function startConfirmationTimeout(clientId) {
    const recordingState = self.clientRecordingStates[clientId]
    recordingState.confirmationTimeout = setTimeout(() => {
        console.warn(
            '[SW] Completion confirmation timed out. Clearing recording for client',
            clientId
        )
        removeRecording(clientId)
    }, 10000)
}

/** Triggered by 'COMPLETE_RECORDING' message; saves recording */
export async function completeRecording(clientId) {
    try {
        const recordingState = self.clientRecordingStates[clientId]
        console.debug('[SW] Completing recording', { clientId, recordingState })
        clearTimeout(recordingState.confirmationTimeout)

        // If global state has reset, reopen IndexedDB
        if (self.dbPromise === undefined) {
            self.dbPromise = openSectionsDB()
        }
        // Add content to DB
        const db = await self.dbPromise
        db.put(SECTIONS_STORE, {
            // Note that request objects can't be stored in the IDB
            // https://stackoverflow.com/questions/32880073/whats-the-best-option-for-structured-cloning-of-a-fetch-api-request-object
            sectionId: recordingState.sectionId, // the key path
            lastUpdated: new Date(),
            // 'requests' can later hold data for normalization
            requests: recordingState.fulfilledRequests,
        }).catch(console.error)

        // Move requests from temp cache to section-<ID> cache
        const sectionCache = await caches.open(recordingState.sectionId)
        const tempCache = await caches.open(getCacheKey('temp', clientId))
        const tempCacheItemKeys = await tempCache.keys()
        tempCacheItemKeys.forEach(async (request) => {
            const response = await tempCache.match(request)
            sectionCache.put(request, response)
        })

        // Clean up
        removeRecording(clientId)

        // Send confirmation message to client
        self.clients.get(clientId).then((client) => {
            client.postMessage({ type: swMsgs.recordingCompleted })
        })
    } catch (err) {
        stopRecording(err, clientId)
    }
}
