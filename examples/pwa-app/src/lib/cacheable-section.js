import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { CenteredContent, CircularLoader, Layer } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useContext } from 'react'
import { useCachedSection } from './cached-sections.js'
import { useOfflineInterface } from './offline-interface.js'

const recordingStates = {
    default: 'default',
    pending: 'pending',
    recording: 'recording',
    error: 'error',
}

const RecordingStatesContext = React.createContext()

export function RecordingStatesProvider({ children }) {
    const [recordingStates, setRecordingStates] = useState(new Map())

    const get = id => recordingStates.get(id)
    const set = (id, recordingState) =>
        setRecordingStates(rs => new Map(rs).set(id, recordingState))
    const remove = id =>
        setRecordingStates(rs => {
            rs.delete(id)
            return rs
        })

    const context = { get, set, remove }

    return (
        <RecordingStatesContext.Provider value={context}>
            {children}
        </RecordingStatesContext.Provider>
    )
}
RecordingStatesProvider.propTypes = { children: PropTypes.node }

/** Returns `{ get(), set(value), remove() }` for a particular ID */
function useRecordingState(id) {
    const context = useContext(RecordingStatesContext)
    if (!context)
        throw new Error(
            'useRecordingState must be used within a RecordingStatesProvider component'
        )
    const newContext = {
        get: () => context.get(id),
        set: val => context.set(id, val),
        remove: () => context.remove(id),
    }
    return newContext
}

export function useCacheableSection(id) {
    const { show } = useAlert(
        ({ message }) => message,
        ({ status }) => ({ [status]: true })
    )
    const offlineInterface = useOfflineInterface()
    const { isCached, lastUpdated, remove, updateSections } = useCachedSection(
        id
    )
    const recordingState = useRecordingState(id)

    // Set up and tear down recording state in context
    useEffect(() => {
        recordingState.set(recordingStates.default)
        return recordingState.remove
    }, [])

    function startRecording() {
        // This promise resolving means that the message to the service worker
        // to start recording was successful. Waiting for resolution prevents
        // unnecessarily rerendering the whole component in case of an error
        offlineInterface
            .startRecording({
                sectionId: id,
                recordingTimeoutDelay: 1000,
                onStarted: onRecordingStarted,
                onCompleted: onRecordingCompleted,
                onError: onRecordingError,
            })
            .then(() => recordingState.set(recordingStates.pending))
            .catch(err => {
                show({
                    status: 'critical',
                    message: i18n.t('Unable to save section: ', err.message),
                })
                console.error(err)
            })
    }

    function onRecordingStarted() {
        recordingState.set(recordingStates.recording)
    }

    function onRecordingCompleted() {
        show({
            status: 'success',
            message: i18n.t('Section successfully saved for offline use.'),
        })
        recordingState.set(recordingStates.default)
        updateSections()
    }

    function onRecordingError(error) {
        show({
            status: 'critical',
            message: i18n.t(
                'There was an error when trying to save this section offline: ',
                error.message
            ),
        })
        console.error('Oops! Something went wrong with the recording.', error)
        recordingState.set(recordingStates.error)
    }

    // Section status: _could_ be accessed by useCachedSection,
    // but provided through this hook for convenience
    return {
        recordingState: recordingState.get(),
        startRecording,
        lastUpdated,
        isCached,
        remove,
    }
}

export function CacheableSection({ id, children }) {
    const { get } = useRecordingState(id)
    const recordingState = get()

    // This will cause the component to reload in the event of a recording error;
    // the state will be cleared next time recording moves to pending.
    // Fixes a component getting stuck while rendered without data after failing a
    // recording while offline.
    // Errors can be handled in useCacheableSection > onRecordingError
    if (recordingState === recordingStates.error) return children

    // Handling rendering this way prevents the component rerendering unnecessarily
    // after completing a recording:
    return (
        <>
            {recordingState === recordingStates.recording && (
                <Layer translucent>
                    <CenteredContent>
                        <CircularLoader />
                    </CenteredContent>
                </Layer>
            )}
            {recordingState !== recordingStates.pending && children}
        </>
    )
}

CacheableSection.propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node,
}
