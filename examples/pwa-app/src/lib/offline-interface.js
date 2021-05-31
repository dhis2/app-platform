import EventEmitter from 'events'
import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    openSectionsDB,
    handleServiceWorkerRegistration,
    swMsgs,
    SECTIONS_STORE,
} from '@dhis2/sw'
import PropTypes from 'prop-types'
import React, { createContext, useContext } from 'react'

// Lives in platform

/** Cleans up SW recording listeners */
function cleanUpListeners(offlineEvents) {
    offlineEvents.removeAllListeners([
        swMsgs.recordingStarted,
        swMsgs.confirmRecordingCompletion,
        swMsgs.recordingCompleted,
        swMsgs.recordingError,
    ])
}

/** Helper to simplify SW message sending */
function swMessage(type, payload) {
    if (!navigator.serviceWorker.controller)
        throw new Error(
            '[Offine interface] Cannot send service worker message - no service worker is registered'
        )
    navigator.serviceWorker.controller.postMessage({ type, payload })
}

/**
 * Provides an interface between the client and the service worker.
 * The interface sends and receives messages from the service worker for
 * the purposes of 'cacheable section' recording and returns some functions
 * that interact with the indexedDB and cache storage APIs.
 */
export class OfflineInterface {
    /**
     * Sets up a service worker by registering it, handling updates, and
     * listening to messages from the service worker.
     *
     * @param {Object} options
     * @param {Function} options.promptUpdate - A function that will be called when a new service worker is installed and ready to activate. Expected to be an alert 'show' function
     * @returns {Function} A clean-up function that removes listeners
     */
    init({ promptUpdate }) {
        if (!('serviceWorker' in navigator)) return null

        function onUpdate(registration) {
            if (!promptUpdate) return
            const reloadMessage = i18n.t(
                'App updates are ready and will be activated after all tabs of this app are closed. Skip waiting and reload to update now?'
            )
            const onConfirm = () =>
                registration.waiting.postMessage({
                    type: swMsgs.skipWaiting,
                })
            promptUpdate({
                message: reloadMessage,
                action: i18n.t('Update'),
                onConfirm: onConfirm,
            })
        }
        // TODO: Registering here can cause some lag while loading;
        // There might be a better time to do it
        handleServiceWorkerRegistration({ onUpdate })

        // Reload window to use new assets when new SW activates
        const reload = () => window.location.reload()
        navigator.serviceWorker.addEventListener('controllerchange', reload)

        // This event emitter helps coordinate with service worker messages
        this.offlineEvents = new EventEmitter()

        // Receives messages from service worker and forwards to event emitter
        const handleServiceWorkerMessage = event => {
            if (!event.data) return
            const { type, payload } = event.data
            this.offlineEvents.emit(type, payload)
        }
        navigator.serviceWorker.addEventListener(
            'message',
            handleServiceWorkerMessage
        )

        // Okay to use other methods now
        this.initialized = true

        // Cleanup function to be returned by useEffect
        return () => {
            navigator.serviceWorker.removeEventListener(
                'message',
                handleServiceWorkerMessage
            )
            navigator.serviceWorker.removeEventListener(
                'controllerchange',
                reload
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
        if (!this.initialized)
            throw new Error(
                'OfflineInterface has not been initialized. Make sure `pwa.enabled` is `true` in `d2.config.js`'
            )
        if (!sectionId || !onStarted || !onCompleted || !onError)
            throw new Error(
                '[Offline interface] The options { sectionId, onStarted, onCompleted, onError } are required when calling startRecording()'
            )

        // Send SW message to start recording
        swMessage(swMsgs.startRecording, {
            sectionId,
            recordingTimeoutDelay,
        })

        // Prep for subsequent events after recording starts:
        this.offlineEvents.once(swMsgs.recordingStarted, onStarted)
        this.offlineEvents.once(
            swMsgs.confirmRecordingCompletion,
            // Confirms recording is okay to save
            () => swMessage(swMsgs.completeRecording)
        )
        this.offlineEvents.once(swMsgs.recordingCompleted, (...args) => {
            cleanUpListeners(this.offlineEvents)
            onCompleted(...args)
        })
        this.offlineEvents.once(swMsgs.recordingError, (...args) => {
            cleanUpListeners(this.offlineEvents)
            onError(...args)
        })
    }

    /**
     * Retrieves a list of cached sections from IndexedDB. Creates DB if it
     * doesn't exist yet to avoid race conditions with service worker.
     * @returns {Promise} A promise that resolves to an array of cached sections.
     */
    async getCachedSections() {
        // Only open/create DB once requested
        if (this.dbPromise === undefined) this.dbPromise = openSectionsDB()
        const db = await this.dbPromise
        return db.getAll(SECTIONS_STORE).catch(err => {
            console.error(
                '[Offline interface] Error in getCachedSections:\n',
                err
            )
            return []
        })
    }

    /**
     * Removes a specified section from the IndexedDB and CacheStorage cache.
     * @param {String} sectionId - ID of the section to remove
     * @returns {Promise} A promise
     */
    async removeSection(sectionId) {
        if (!sectionId) throw new Error('No section ID specified to delete')
        // Only open/create DB once requested
        if (this.dbPromise === undefined) this.dbPromise = openSectionsDB()
        return Promise.all([
            caches.delete(sectionId),
            (await this.dbPromise).delete(SECTIONS_STORE, sectionId),
        ]).catch(err => {
            console.error('[Offline interface] Error in removeSection:\n', err)
            return null
        })
    }
}

// Offline interface context
// Lives in runtime

const OfflineContext = createContext()

export function OfflineInterfaceProvider({ offlineInterface, children }) {
    const { show } = useAlert(
        ({ message }) => message,
        ({ action, onConfirm }) => ({
            actions: [{ label: action, onClick: onConfirm }],
            permanent: true,
        })
    )

    React.useEffect(() => {
        // TODO: refactor from env var; receive from config
        if (process.env.REACT_APP_DHIS2_APP_PWA_ENABLED === 'true')
            // init() Returns a cleanup function
            return offlineInterface.init({ promptUpdate: show })
    }, [])

    return (
        <OfflineContext.Provider value={offlineInterface}>
            {children}
        </OfflineContext.Provider>
    )
}

OfflineInterfaceProvider.propTypes = {
    children: PropTypes.node,
    offlineInterface: PropTypes.shape({ init: PropTypes.func }),
}

export function useOfflineInterface() {
    const offlineInterface = useContext(OfflineContext)

    if (offlineInterface === undefined) {
        throw new Error(
            'useOfflineInterface must be used within an OfflineInterfaceProvider'
        )
    }

    return offlineInterface
}
