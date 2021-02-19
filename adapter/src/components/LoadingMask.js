import { Layer, CenteredContent, CircularLoader, layers } from '@dhis2/ui'
import React from 'react'

export const LoadingMask = () => (
    <Layer translucent level={layers.alert}>
        <CenteredContent>
            <CircularLoader />
        </CenteredContent>
    </Layer>
)
