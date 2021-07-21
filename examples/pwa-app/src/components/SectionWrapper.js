import {
    useAlert,
    CacheableSection,
    useCacheableSection,
    useOnlineStatus,
} from '@dhis2/app-runtime'
import { Button, ButtonStrip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import LoadingMask from './LoadingMask.js'
import VisualizationsList from './VisualizationsList.js'

// Demonstrates the offline service APIs

function Controls({ id }) {
    const { show } = useAlert(
        ({ message }) => message,
        ({ props }) => props
    )
    const {
        startRecording,
        lastUpdated,
        isCached,
        remove,
        /* recordingState, */ // one of 'default', 'pending', 'recording', or 'error'
    } = useCacheableSection(id)
    const { offline /*, online */ } = useOnlineStatus({
        debounceDelay: 1000, // the default
    })

    function handleRecording() {
        const onStarted = () => {}
        const onError = err =>
            show({
                message: `Error during recording: ${err.message}`,
                props: { critical: true },
            })
        const onCompleted = () =>
            show({ message: 'Recording complete', props: { success: true } })
        startRecording({
            onStarted,
            onCompleted,
            onError,
            recordingTimeoutDelay: 1000, // the default
        })
    }

    async function handleRemove() {
        const success = await remove()
        const message = success
            ? 'Successfully removed section from offline storage'
            : 'Section not found'
        show({ message, props: { success } })
    }

    return (
        <>
            <p>{offline ? 'Offline' : 'Online'}</p>
            <p>{`Is cached: ${isCached}. Last updated: ${
                lastUpdated || 'n/a'
            }`}</p>
            <ButtonStrip>
                <Button small onClick={handleRecording} disabled={offline}>
                    Start recording
                </Button>
                <Button small destructive onClick={handleRemove}>
                    Remove from cache
                </Button>
            </ButtonStrip>
        </>
    )
}
Controls.propTypes = { id: PropTypes.string }

export default function SectionWrapper({ id }) {
    return (
        <div>
            <Controls id={id} />
            <CacheableSection id={id} loadingMask={<LoadingMask />}>
                <VisualizationsList />
            </CacheableSection>
        </div>
    )
}
SectionWrapper.propTypes = { id: PropTypes.string }
