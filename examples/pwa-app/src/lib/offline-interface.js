import EventEmitter from 'events'
import { useAlert } from '@dhis2/app-runtime'
import { swMsgs, DB_NAME, OS_NAME } from '@dhis2/sw' // service worker constants
import { openDB } from 'idb'
import PropTypes from 'prop-types'
import React, { createContext, useContext } from 'react'

/**
 * Initializes an interface between the client and the service worker.
 * The interface sends and receives messages from the service worker for
 * the purposes of 'cacheable section' recording and returns some functions
 * that interact with the indexedDB and cache storage APIs.
 *
 * @returns {Object} { startRecording: func, removeSection: func, getCachedSections: func }
 */
// TODO: Make a class?
// Lives in platform
export function initOfflineInterface() {
    if (!('serviceWorker' in navigator)) return null

    // An EventEmitter, internal to offlineInterface, is used to help
    // coordinate with the service worker interface
    const offlineEvents = new EventEmitter()

    function init({ showSwAlert }) {
        // TODO: Make sure not to reregister
        // if (registered) skip

        // TODO: Maybe handle registration here
        // registerSw({ onUpdate: showSwAlert })

        // * Alert test:
        // reload() would be () => swMessage(swMsgs.skipWaiting)
        showSwAlert && showSwAlert({ reload: () => console.log('derp') })

        // Receives messages from service worker and forwards to event emitter
        // TODO: Handle error events
        function handleServiceWorkerMessage(event) {
            if (!event.data) return

            console.log('[Offline interface] Received message:', event.data)

            const { type, payload } = event.data
            offlineEvents.emit(type, payload)
        }
        navigator.serviceWorker.onmessage = handleServiceWorkerMessage

        // TODO: Teardown function - return fn here; return from useEffect
        // (or own method)
    }

    // Helper to simplify SW message sending
    function swMessage(type, payload) {
        if (!navigator.serviceWorker.controller)
            throw new Error(
                '[Offine interface] Cannot send service worker message - no service worker is registered'
            )
        navigator.serviceWorker.controller.postMessage({ type, payload })
    }

    function cleanUpListeners() {
        offlineEvents.removeAllListeners([
            swMsgs.recordingStarted,
            swMsgs.confirmRecordingCompletion,
            swMsgs.recordingCompleted,
            swMsgs.recordingError,
        ])
    }

    async function startRecording({
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

        // TODO: This should throw an error if offline

        // Send SW message to start recording
        swMessage(swMsgs.startRecording, {
            sectionId,
            recordingTimeoutDelay,
        })

        // Prep for subsequent events after recording starts
        offlineEvents.once(swMsgs.recordingStarted, onStarted)
        offlineEvents.once(swMsgs.confirmRecordingCompletion, () =>
            // Confirms recording is okay to save
            swMessage(swMsgs.completeRecording)
        )
        offlineEvents.once(swMsgs.recordingCompleted, (...args) => {
            cleanUpListeners()
            onCompleted(...args)
        })
        offlineEvents.once(swMsgs.recordingError, (...args) => {
            cleanUpListeners()
            onError(...args)
        })
    }

    async function getCachedSections() {
        const db = await openDB(DB_NAME)
        return db.getAll(OS_NAME).catch(err => {
            console.error(
                '[Offline interface] Error in getCachedSections:\n',
                err
            )
            return []
        })
    }

    async function removeSection(sectionId) {
        if (!sectionId) throw new Error('No section ID specified to delete')
        return Promise.all([
            caches.delete(sectionId),
            (await openDB(DB_NAME)).delete(OS_NAME, sectionId),
        ]).catch(err => {
            console.error('[Offline interface] Error in removeSection:\n', err)
            return null
        })
    }

    return {
        init,
        startRecording,
        removeSection,
        getCachedSections,
    }
}

// Offline interface context
// Lives in runtime

const OfflineContext = createContext()

export function OfflineInterfaceProvider({ offlineInterface, children }) {
    const { show } = useAlert(
        'A new service worker (which provides offline caching) is installed and ready to activate. Reload page to activate now?',
        ({ reload }) => ({
            actions: [{ label: 'Reload', onClick: reload }],
            permanent: true,
        })
    )

    React.useEffect(() => {
        // TODO: Check if registered ~
        offlineInterface.init({ showSwAlert: show })
        // TODO: Clean up
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
