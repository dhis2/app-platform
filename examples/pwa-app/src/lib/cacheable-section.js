import React, { useState } from 'react'
import { useOfflineInterface } from './offline-interface.js'
import { useCachedSections } from './cached-sections.js'

export function useCacheableSection(id) {
    const offlineInterface = useOfflineInterface()
    const {
        cachedSections,
        removeSection,
        updateSections,
    } = useCachedSections()
    const [recordingState, setRecordingState] = useState(null)

    function startRecording() {
        setRecordingState(recordingStates.pending)
        offlineInterface.startRecording(
            { sectionId: id, recordingTimeout: 1000 },
            messageCallback
        )
    }

    // Hypothetical: this gets called upon each event after recording starts
    // Alternative: startRecording = () => offlineInterface.startRecording(data, { startedRecordingCb, finishedRecordingCb })
    // (offline interface would handle 'confirm recording' behind the scenes)
    function messageCallback({ type, payload }) {
        // this looks like a reducer action ^
        switch (type) {
            case 'RECORDING_STARTED':
                setRecordingState(recordingStates.recording)
                break
            case 'CONFIRM_RECORDING_COMPLETION':
                // TODO: This should be handled behind the scenes
                offlineInterface.completeRecording()
                break
            case 'RECORDING_ERROR':
                // TODO: Handle error. Alert too?
                console.error(
                    'Oops! Something went wrong with the recording.',
                    payload.err
                )
                setRecordingState(null)
                break
            case 'RECORDING_COMPLETE':
                setRecordingState(null)
                updateSections()
                break
            default:
                console.warn(
                    `Service worker message of unexpected type ${type} received`
                )
                return
        }
    }

    // Section status: this and 'delete' _could_ be accessed by useCachedSection,
    // but they're provided through this hook for convenience
    const lastUpdated = cachedSections.get(id) // might be undefined
    const isCached = !!lastUpdated
    const remove = () => removeSection(id)

    return {
        recordingState,
        startRecording,
        lastUpdated,
        isCached,
        remove,
    }
}

export function CacheableSection({ recordingState, children }) {
    switch (recordingState) {
        case recordingStates.pending: {
            return null
        }
        case recordingStates.recording: {
            // TODO: Screen cover
            return <ScreenCover>{children}</ScreenCover>
        }
        default:
            return children
    }
}
