import { Layer, CenteredContent, CircularLoader } from '@dhis2/ui'
import React from 'react'

export default function LoadingMask() {
    return (
        <Layer translucent>
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        </Layer>
    )
}
