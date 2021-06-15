import {
    CacheableSection,
    useCacheableSection,
    useOnlineStatus,
} from '@dhis2/app-service-offline'
import { Button, ButtonStrip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import LoadingMask from './LoadingMask.js'
import VisualizationsList from './VisualizationsList.js'

function Controls({ id }) {
    const {
        startRecording,
        lastUpdated,
        isCached,
        remove,
        /* recordingState, */
    } = useCacheableSection(id)
    const { offline /*, online */ } = useOnlineStatus()

    return (
        <>
            <p>{offline ? 'Offline' : 'Online'}</p>
            <p>{`Is cached: ${isCached}. Last updated: ${
                lastUpdated || 'n/a'
            }`}</p>
            <ButtonStrip>
                <Button small onClick={startRecording} disabled={offline}>
                    Start recording
                </Button>
                <Button small destructive onClick={remove}>
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
