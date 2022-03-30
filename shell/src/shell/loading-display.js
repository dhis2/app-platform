import {
    CenteredContent,
    CircularLoader,
    CssReset,
    Layer,
    layers,
} from '@dhis2/ui'
import React from 'react'

export default function LoadingDisplay() {
    return (
        <>
            <CssReset />
            <Layer translucent level={layers.alert}>
                <CenteredContent>
                    <CircularLoader />
                </CenteredContent>
            </Layer>
        </>
    )
}
