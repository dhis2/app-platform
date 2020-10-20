import React from 'react'
import { Layer, CenteredContent, CircularLoader, layers } from '@dhis2/ui'

export const LoadingMask = () => (
    <Layer translucent level={layers.alert}>
        <CenteredContent>
            <CircularLoader />
        </CenteredContent>
    </Layer>
)
