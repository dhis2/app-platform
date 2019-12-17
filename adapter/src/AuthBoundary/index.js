import React from 'react'
import { useDataQuery } from '@dhis2/app-runtime'

import { ScreenCover, CircularLoader } from '@dhis2/ui-core'
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
            <ScreenCover>
                <CircularLoader />
            </ScreenCover>
        )
    }

    if (error) {
        return <LoginModal url={url} />
    }

    return children
}
