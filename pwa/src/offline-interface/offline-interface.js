import EventEmitter from 'events'
import i18n from '@dhis2/d2-i18n'
import { swMsgs } from '../lib/constants'
import { register, unregister, checkForUpdates } from '../lib/registration'
import { openSectionsDB, SECTIONS_STORE } from '../lib/sections-db'

/** Helper to simplify SW message sending */
function swMessage(type, payload) {
    if (!navigator.serviceWorker.controller) {
        throw new Error(
            '[Offine interface] Cannot send service worker message - no service worker is registered'
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
        this.pwaEnabled = process.env.REACT_APP_DHIS2_APP_PWA_ENABLED === 'true'

        if (this.pwaEnabled) {
            register()
        } else {
            unregister()
        }

        if ('serviceWorker' in navigator) {
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
        }
    }
    /**
     * Checks for service worker updates and sets up an interface for
     * communicating with the service worker.
     * If PWA is not enabled, a killswitch service worker should register
     * itself and skip waiting without needing to check for updates.
     *
     * @param {Object} options
     * @param {Function} options.promptUpdate - A function that will be called when a new service worker is installed and ready to activate. Expected to be an alert 'show' function
     * @returns {Function} A clean-up function that removes listeners
     */
    init({ promptUpdate }) {
        if (!('serviceWorker' in navigator)) {
            return null
        }

        function onUpdate(registration) {
            const skipWaiting = () =>
                registration.waiting.postMessage({
                    type: swMsgs.skipWaiting,
                })

            // If no update prompt function is provided, or if in dev or test
            // environments, skip waiting and activate newly installed SW
            // without waiting
            if (!promptUpdate || process.env.NODE_ENV !== 'production') {
                skipWaiting()
                return
            }

            // Otherwise, call promptUpdate callback with appropriate args
            const reloadMessage = i18n.t(
                'App updates are ready and will be activated after all tabs of this app are closed. Skip waiting and reload to update now?'
            )
            promptUpdate({
                message: reloadMessage,
                action: i18n.t('Update'),
                onConfirm: skipWaiting,
            })
        }

        // Check for SW updates
        checkForUpdates({ onUpdate })

        // This event emitter helps coordinate with service worker messages
        this.offlineEvents = new EventEmitter()

        // Receives messages from service worker and forwards to event emitter
        const handleServiceWorkerMessage = event => {
            if (!event.data) {
                return
            }
            const { type, payload } = event.data
            this.offlineEvents.emit(type, payload)
        }
        navigator.serviceWorker.addEventListener(
            'message',
            handleServiceWorkerMessage
        )

        // Okay to use 'startRecording' now
        this.initialized = true

        // Cleanup function to be returned by useEffect
        return () => {
            navigator.serviceWorker.removeEventListener(
                'message',
                handleServiceWorkerMessage
            )
        }
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
        if (!this.initialized) {
            throw new Error(
                'OfflineInterface has not been initialized. Make sure `pwa.enabled` is `true` in `d2.config.js`'
            )
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
            messageTypes.forEach(messageType =>
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
        if (!this.pwaEnabled) {
            throw new Error(
                'Cannot get cached sections - PWA is not enabled in d2.config.js'
            )
        }

        await navigator.serviceWorker.ready
        if (this.dbPromise === undefined) {
            this.dbPromise = openSectionsDB()
        }
        const db = await this.dbPromise

        const sections = await db.getAll(SECTIONS_STORE)
        const cacheKeys = await caches.keys()
        // Validate that each section in IDB has cached data
        const validSections = sections.filter(section =>
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
        if (!this.pwaEnabled) {
            throw new Error(
                'Cannot remove section - PWA is not enabled in d2.config.js'
            )
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
