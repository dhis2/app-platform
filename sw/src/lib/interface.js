import { OfflineEventHandler } from '@dhis2/app-runtime'
import { openDB } from 'idb'
import { msgTypes, DB_NAME, OS_NAME } from './constants'

// TODO: choose message/event name format & API: 'event-name', 'eventName', or 'EVENT_NAME'?

export function initInterface() {
    if (!('serviceWorker' in navigator)) return

    // Reloads the window when a new service worker is activated
    // (Triggered as a a result of 'skip waiting' from handleNewSwReady())
    navigator.serviceWorker.addEventListener(
        'controllerchange',
        window.location.reload
    )

    // Process SW messages to be useful to OfflineEventHandler
    navigator.serviceWorker.onmessage = handleSwMessage

    // Handle messages from client to service worker
    OfflineEventHandler.subscribe('start-recording', handleStartRecording)
    OfflineEventHandler.subscribe('complete-recording', handleCompleteRecording)
    OfflineEventHandler.subscribe('delete-recording', handleDeleteRecording)
    OfflineEventHandler.subscribe(
        'get-recorded-sections',
        handleGetRecordedSections
    )
}

// TODO: To be used as `onUpdate` callback in serviceWorkerRegistration
export function handleNewSwReady(registration) {
    OfflineEventHandler.trigger('new-sw-ready')

    OfflineEventHandler.subscribe('skip-waiting', () => {
        registration.waiting.postMessage({ type: msgTypes.SKIP_WAITING })
    })
}

// Relays messages from the service worker as events in EventHandler
function handleSwMessage(event) {
    if (!event.data) return
    OfflineEventHandler.trigger(event.data.type, event.data.payload)
}

function handleStartRecording({ sectionId, stopRecordingDelay }) {
    navigator.serviceWorker.controller.postMessage({
        type: msgTypes.START_RECORDING,
        payload: { sectionId, stopRecordingDelay },
    })
}

function handleCompleteRecording() {
    navigator.serviceWorker.controller.postMessage({
        type: msgTypes.COMPLETE_RECORDING,
    })
}

function handleDeleteRecording({ sectionId }) {
    navigator.serviceWorker.controller.postMessage({
        type: msgTypes.DELETE_RECORDED_SECTION,
        payload: { sectionId },
    })
}

// This could also be implemented in the service worker...
// I think it's just as good here though, and saves a few postMessages.
// Maybe this doesn't need to be an event though; can just be invoked as a fn
async function handleGetRecordedSections() {
    const db = await openDB(DB_NAME)
    const sectionsList = await db.getAll(OS_NAME)
    OfflineEventHandler.trigger(msgTypes.RECORDED_SECTIONS_LIST, {
        sectionsList,
    })
}
