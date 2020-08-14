import React from 'react'
import { useDataQuery } from '@dhis2/app-runtime'

import { Layer, layers, CenteredContent, CircularLoader } from '@dhis2/ui'
import { LoginModal } from './LoginModal'
import { useLocale } from './useLocale'

const settingsQuery = {
    userSettings: {
        resource: 'userSettings',
    },
}

export const AuthBoundary = ({ url, children }) => {
    const { loading, error, data } = useDataQuery(settingsQuery)
    useLocale(data && data.userSettings.keyUiLocale)

    if (loading) {
        return (
            <Layer translucent level={layers.alert}>
                <CenteredContent>
                    <CircularLoader />
                </CenteredContent>
            </Layer>
        )
    }

    if (error) {
        return <LoginModal url={url} />
    }

    return children
}
