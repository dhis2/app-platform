import EventEmitter from 'events'
import { useAlert } from '@dhis2/app-runtime'
import { swMsgs, DB_NAME, OS_NAME } from '@dhis2/sw' // service worker constants
import { openDB } from 'idb'
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
    constructor() {
        // This event emitter helps coordinate with service worker messages
        this.offlineEvents = new EventEmitter()
    }

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
        // TODO: Make sure not to reregister
        // if (registered) skip

        // TODO: Handle registration here
        // registerSw({ onUpdate: promptUpdate })

        // Alert test:
        if (promptUpdate) {
            const reloadMessage =
                'App updates are ready and will be activated after all tabs of this app are closed. Skip waiting and reload to update now?'
            promptUpdate({
                message: reloadMessage,
                action: 'Update',
                // onConfirm() will be () => swMessage(swMsgs.skipWaiting)
                onConfirm: () => console.log('TODO: skip waiting'),
            })
        }

        // Receives messages from service worker and forwards to event emitter
        function handleServiceWorkerMessage(event) {
            if (!event.data) return
            const { type, payload } = event.data
            this.offlineEvents.emit(type, payload)
        }
        navigator.serviceWorker.onmessage = handleServiceWorkerMessage

        return () => {
            navigator.serviceWorker.onmessage = undefined
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
            cleanUpListeners()
            onCompleted(...args)
        })
        this.offlineEvents.once(swMsgs.recordingError, (...args) => {
            cleanUpListeners()
            onError(...args)
        })
    }

    /**
     * Retrieves a list of cached sections from IndexedDB.
     * @returns {Promise} A promise that resolves to an array of cached sections.
     */
    async getCachedSections() {
        const db = await openDB(DB_NAME)
        return db.getAll(OS_NAME).catch(err => {
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
        return Promise.all([
            caches.delete(sectionId),
            (await openDB(DB_NAME)).delete(OS_NAME, sectionId),
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
