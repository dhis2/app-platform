import {
    CacheableSection,
    useCacheableSection,
} from '@dhis2/app-service-offline'
import { Button, ButtonStrip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import VisualizationsList from './VisualizationsList.js'

function Controls({ id }) {
    const {
        startRecording,
        lastUpdated,
        isCached,
        remove,
        /* recordingState, */
    } = useCacheableSection(id)

    return (
        <>
            <p>{`Is cached: ${isCached}. Last updated: ${
                lastUpdated || 'n/a'
            }`}</p>
            <ButtonStrip>
                <Button small onClick={startRecording}>
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
            <CacheableSection id={id}>
                <VisualizationsList />
            </CacheableSection>
        </div>
    )
}
SectionWrapper.propTypes = { id: PropTypes.string }
