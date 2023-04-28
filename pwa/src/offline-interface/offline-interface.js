import EventEmitter from 'events'
import { swMsgs } from '../lib/constants.js'
import {
    register,
    unregister,
    checkForUpdates,
    getRegistrationState,
} from '../lib/registration.js'
import { openSectionsDB, SECTIONS_STORE } from '../lib/sections-db.js'

const PWA_ENABLED = process.env.REACT_APP_DHIS2_APP_PWA_ENABLED === 'true'

/**
 * This and the following 'test' functions test for PWA features and log errors
 * if there's an issue so they can be reused in the Offline Interface methods.
 *
 * Known situations when navigator.serviceWorker is not available:
 * 1. Private browsing in firefox
 * 2. Insecure contexts (e.g. http that's not local host)
 */
function testSWAvailable() {
    if ('serviceWorker' in navigator) {
        return true
    }

    const msg =
        (!window.isSecureContext
            ? 'This window is not a secure context -- see https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts.'
            : '`serviceWorker` is not available on `navigator`.') +
        ' PWA features will not work.'
    console.error(new Error(msg))
    return false
}

function testPWAEnabled() {
    if (PWA_ENABLED) {
        return true
    }

    const msg =
        'PWA is not enabled in `d2.config.js`. No service worker will be registered and offline interface features will not work.'
    console.error(new Error(msg))
    return false
}

function testPWAAndSW() {
    return testSWAvailable() && testPWAEnabled()
}

/** Helper to simplify SW message sending */
function swMessage(type, payload) {
    if (!navigator.serviceWorker.controller) {
        throw new Error(
            '[Offine interface] Cannot send service worker message - no service worker is controlling this page.'
        )
    }
    navigator.serviceWorker.controller.postMessage({ type, payload })
}

/**
 * Provides an interface between the client and the service worker.
 * The interface sends and receives messages from the service worker for
 * the purposes of 'cacheable section' recording and returns some functions
 * that interact with the indexedDB and cache storage APIs.
 */
export class OfflineInterface {
    constructor() {
        // Helper property that consumers can check
        this.pwaEnabled = PWA_ENABLED

        // The latest value from the service worker. The `this.ready` promise
        // will resolve when this gets a boolean value from the SW
        this.latestIsConnected = null

        if (this.pwaEnabled) {
            register()
        } else {
            unregister()
        }

        if (!testSWAvailable()) {
            // Make this value available for ServerVersionProvider
            this.ready = Promise.resolve()
            return
        }

        // Reload when a new SW gains control
        let reloading
        navigator.serviceWorker.oncontrollerchange = () => {
            if (reloading) {
                // Fixes an infinite update loop when 'Update on reload' is
                // checked in Chrome
                return
            }
            reloading = true
            window.location.reload()
        }

        // This event emitter helps coordinate with service worker messages
        this.offlineEvents = new EventEmitter()
        // Receives messages from service worker and forwards to event emitter
        const handleSWMessage = (event) => {
            if (!event.data) {
                return
            }
            const { type, payload } = event.data
            this.offlineEvents.emit(type, payload)
        }
        navigator.serviceWorker.addEventListener('message', handleSWMessage)

        // (todo: refactor to another function)
        // When this promise resolves, it indicates that a connection status
        // value has been received from the service worker and is available
        // as a property on this offlineInterface.
        // Expected to be used by ServerVersionProvider in the app adapter
        // to delay rendering the app-runtime Provider until ready.
        this.ready = !this.pwaEnabled
            ? Promise.resolve()
            : new Promise((resolve) => {
                  // Listen to status updates and store the latest value here so the
                  // connection status hook can initialize to this value
                  this.offlineEvents.on(
                      swMsgs.dhis2ConnectionStatusUpdate,
                      ({ isConnected }) => {
                          // If this is the first time receiving an update from the
                          // SW, resolve the this.ready promise
                          const shouldResolveReady =
                              this.latestIsConnected === null
                          this.latestIsConnected = isConnected
                          if (shouldResolveReady) {
                              resolve()
                          }
                      }
                  )

                  try {
                      // Prompt the SW to send back connection status
                      // without its usual delay
                      swMessage(swMsgs.getImmediateDhis2ConnectionStatusUpdate)
                  } catch {
                      // It's likely the SW hasn't installed yet, so go ahead and
                      // resolve `ready` -- the app must be online to get to this case
                      // anyway
                      this.latestIsConnected = true
                      resolve()
                  }
              })
    }

    /** Basically `checkForUpdates` from registration.js exposed here */
    checkForNewSW({ onNewSW }) {
        // Check for SW updates (or first activation)
        checkForUpdates({ onUpdate: onNewSW })
    }

    async getRegistrationState() {
        return await getRegistrationState()
    }

    /**
     * Requests clients info from the active service worker.
     * @returns {Promise}
     */
    getClientsInfo() {
        if (!testSWAvailable()) {
            return Promise.resolve({ clientsCount: 0 })
        }

        return new Promise((resolve, reject) => {
            navigator.serviceWorker.getRegistration().then((registration) => {
                const newestSW = registration?.waiting || registration?.active
                if (!newestSW) {
                    resolve({ clientsCount: 0 })
                    return
                }

                // Send request message to newest SW
                newestSW.postMessage({ type: swMsgs.getClientsInfo })
                // Resolve with payload received from SW `clientsInfo` message
                this.offlineEvents.once(swMsgs.clientsInfo, resolve)
                // Clean up potentially unused listeners eventually
                setTimeout(() => {
                    reject('Request for clients info timed out')
                    this.offlineEvents.removeAllListeners(swMsgs.clientsInfo)
                }, 2000)
            })
        })
    }

    /**
     * Makes a new SW either skip waiting if it's an update,
     * or claim clients if it's the first SW activation
     */
    useNewSW() {
        if (!testSWAvailable()) {
            return Promise.resolve()
        }

        return navigator.serviceWorker
            .getRegistration()
            .then((registration) => {
                if (!registration) {
                    throw new Error('No service worker is registered')
                }
                if (registration.waiting) {
                    // Update existing service worker
                    registration.waiting.postMessage({
                        type: swMsgs.skipWaiting,
                    })
                } else if (registration.active) {
                    // (First SW activation) Have SW take control of clients
                    registration.active.postMessage({
                        type: swMsgs.claimClients,
                    })
                }
            })
    }

    /**
     * @param {Object} params
     * @param {Function} params.onUpdate - Called on status updates with argument { isConnected: bool }
     * @returns {Function} - An unsubscribe function
     */
    subscribeToDhis2ConnectionStatus({ onUpdate }) {
        this.offlineEvents.on(swMsgs.dhis2ConnectionStatusUpdate, onUpdate)
        return () =>
            this.offlineEvents.off(swMsgs.dhis2ConnectionStatusUpdate, onUpdate)
    }

    /**
     * Starts a recording session for a cacheable section. Returns a promise
     * that resolves if the SW message is successfully sent or rejects if
     * there's an error, which can happen if a service worker is not registered.
     *
     * Note that this promise resolving does not indicate recording is ready to
     * start yet, but it is a good time to enter a 'recording pending' state.
     * The `onStarted()` function in the options object will be called when the
     * SW signals recording is actually ready to go.
     *
     * @param {Object} options
     * @param {String} options.sectionId - ID of section to record
     * @param {Number} options.recordingTimeoutDelay - How long to wait after all pending requests have resolved before stopping recording, if no other requests come in
     * @param {Function} options.onStarted - Will be called when the service worker is set up for recording and ready to go.
     * @param {Function} options.onCompleted - Called when recording completes successfully and the cached section has been saved in the IndexedDB and CacheStorage.
     * @param {Function} options.onError - Called if there's an error during recording; receives an Error object as an argument.
     */
    async startRecording({
        sectionId,
        recordingTimeoutDelay,
        onStarted,
        onCompleted,
        onError,
    }) {
        if (!testPWAAndSW()) {
            return
        }

        if (!sectionId || !onStarted || !onCompleted || !onError) {
            throw new Error(
                '[Offline interface] The options { sectionId, onStarted, onCompleted, onError } are required when calling startRecording()'
            )
        }

        // Send SW message to start recording
        swMessage(swMsgs.startRecording, {
            sectionId,
            recordingTimeoutDelay,
        })

        /** Cleans up SW recording listeners */
        const cleanUpListeners = () => {
            const messageTypes = [
                swMsgs.recordingStarted,
                swMsgs.recordingError,
                swMsgs.recordingCompleted,
                swMsgs.confirmRecordingCompletion,
            ]
            messageTypes.forEach((messageType) =>
                this.offlineEvents.removeAllListeners(messageType)
            )
        }

        // Prep for subsequent events after recording starts:
        this.offlineEvents.once(swMsgs.recordingStarted, onStarted)
        this.offlineEvents.once(
            swMsgs.confirmRecordingCompletion,
            // Confirms recording is okay to save
            () => swMessage(swMsgs.completeRecording)
        )
        this.offlineEvents.once(swMsgs.recordingCompleted, () => {
            cleanUpListeners()
            onCompleted()
        })
        this.offlineEvents.once(swMsgs.recordingError, ({ msg }) => {
            cleanUpListeners()
            // Make error out of message from SW (firefox SW message interface
            // doesn't handle payloads other than simple objects)
            const error = new Error(msg)
            onError(error)
        })
    }

    /**
     * Retrieves a list of cached sections from IndexedDB. Creates DB if it
     * doesn't exist yet to avoid race conditions with service worker.
     * @returns {Promise} A promise that resolves to an array of cached sections.
     */
    async getCachedSections() {
        if (!testPWAAndSW()) {
            return []
        }

        await navigator.serviceWorker.ready
        if (this.dbPromise === undefined) {
            this.dbPromise = openSectionsDB()
        }
        const db = await this.dbPromise

        const sections = await db.getAll(SECTIONS_STORE)
        const cacheKeys = await caches.keys()
        // Validate that each section in IDB has cached data
        const validSections = sections.filter((section) =>
            cacheKeys.includes(section.sectionId)
        )

        return validSections
    }

    /**
     * Removes a specified section from the IndexedDB and CacheStorage cache.
     * @param {String} sectionId - ID of the section to remove
     * @returns {Promise} A promise that resolves to `true` if at least one of the cache or the idb entry are deleted or `false` if neither were found.
     */
    async removeSection(sectionId) {
        if (!testPWAAndSW()) {
            return false
        }
        if (!sectionId) {
            throw new Error('No section ID specified to delete')
        }

        await navigator.serviceWorker.ready
        if (this.dbPromise === undefined) {
            this.dbPromise = openSectionsDB()
        }
        const db = await this.dbPromise

        const sectionExists = await db.count(SECTIONS_STORE, sectionId)
        return Promise.all([
            caches.delete(sectionId),
            !!sectionExists &&
                db.delete(SECTIONS_STORE, sectionId).then(() => true),
        ]).then(
            ([cacheDeleted, dbEntryDeleted]) => cacheDeleted || dbEntryDeleted
        )
    }
}
