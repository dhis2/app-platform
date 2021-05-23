import { Button, ButtonStrip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import {
    CacheableSection,
    useCacheableSection,
} from '../lib/cacheable-section.js'
import CacheableComponent from './CacheableComponent.js'

export default function SectionWrapper({ id }) {
    const {
        startRecording,
        recordingState,
        lastUpdated,
        isCached,
        remove,
    } = useCacheableSection(id)

    return (
        <div>
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
            <CacheableSection recordingState={recordingState}>
                <CacheableComponent />
            </CacheableSection>
        </div>
    )
}

SectionWrapper.propTypes = {
    id: PropTypes.string,
}
