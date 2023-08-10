import { Layer, CenteredContent, CircularLoader, layers } from '@dhis2/ui'
import React from 'react'

export const LoadingMask = () => (
    <Layer level={layers.alert}>
        <CenteredContent>
            <CircularLoader />
        </CenteredContent>
    </Layer>
)
