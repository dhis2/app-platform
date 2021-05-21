import { swMsgs, DB_NAME, OS_NAME } from '@dhis2/sw' // service worker constants
import { openDB } from 'idb'
import EventEmitter from 'events'
import React, { createContext, useContext } from 'react'

export function makeOfflineInterface() {
    if (!('serviceWorker' in navigator)) return null

    // An EventEmitter is used to help coordinate with the service worker interface
    const offlineEvents = new EventEmitter()

    // Receives messages from service worker and forwards to event emitter
    // TODO: Handle error events
    function handleServiceWorkerMessage(event) {
        if (!event.data) return
        const { type, payload } = event.data
        offlineEvents.emit(type, payload)
    }
    navigator.serviceWorker.onmessage = handleServiceWorkerMessage

    // Helper to simplify SW message sending
    function swMessage(type, payload) {
        if (!navigator.serviceWorker.controller)
            throw new Error(
                '[Offine interface] Cannot send service worker message - no service worker is registered'
            )
        navigator.serviceWorker.controller.postMessage({ type, payload })
    }

    // * Should everything be promise-based or callback-based? Or ok to mix?
    async function startRecording({
        sectionId,
        recordingTimeout,
        recordingStarted,
        recordingCompleted,
    }) {
        if (!sectionId || !recordingStarted || !recordingCompleted)
            throw new Error(
                '[Offline interface] The options { sectionId, recordingStarted, recordingCompleted } are required when calling startRecording()'
            )

        // Send SW message to start recording
        swMessage(swMsgs.startRecording, { sectionId, recordingTimeout })

        // Prep for subsequent events after recording starts
        offlineEvents.once(swMsgs.recordingStarted, recordingStarted)
        offlineEvents.once(swMsgs.requestCompletionConfirmation, () =>
            // Confirms recording is okay to save
            swMessage(swMsgs.completeRecording)
        )
        offlineEvents.once(swMsgs.recordingCompleted, recordingCompleted)
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
        startRecording,
        removeSection,
        getCachedSections,
    }
}

// Offline interface context

const OfflineContext = createContext()

export function OfflineInterfaceProvider({ offlineInterface, children }) {
    return (
        <OfflineContext.Provider value={offlineInterface}>
            {children}
        </OfflineContext.Provider>
    )
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
