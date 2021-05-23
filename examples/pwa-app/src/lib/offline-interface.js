import EventEmitter from 'events'
import { swMsgs, DB_NAME, OS_NAME } from '@dhis2/sw' // service worker constants
import { openDB } from 'idb'
import PropTypes from 'prop-types'
import React, { createContext, useContext } from 'react'

export function makeOfflineInterface() {
    if (!('serviceWorker' in navigator)) return null

    // An EventEmitter is used to help coordinate with the service worker interface
    const offlineEvents = new EventEmitter()

    // Receives messages from service worker and forwards to event emitter
    // TODO: Handle error events
    function handleServiceWorkerMessage(event) {
        if (!event.data) return

        console.log('[Offline interface] Received message:', event.data)

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

    function cleanUpListeners() {
        offlineEvents.removeAllListeners([
            swMsgs.recordingStarted,
            swMsgs.confirmRecordingCompletion,
            swMsgs.recordingCompleted,
            swMsgs.recordingError,
        ])
    }

    // * Should everything be promise-based or callback-based? Or ok to mix?
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

OfflineInterfaceProvider.propTypes = {
    children: PropTypes.node,
    offlineInterface: PropTypes.shape({}),
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
