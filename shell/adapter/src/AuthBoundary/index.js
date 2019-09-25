import React from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '../locales'

import { ScreenCover, CircularLoader } from '@dhis2/ui-core'
import { LoginModal } from './LoginModal'

const settingsQuery = {
    userSettings: {
        resource: 'userSettings',
    },
}

export const AuthBoundary = ({ url, children }) => {
    i18n.changeLanguage(window.navigator.language)
    const { loading, error, data } = useDataQuery(settingsQuery)

    if (loading) {
        return (
            <ScreenCover>
                <CircularLoader />
            </ScreenCover>
        )
    }

    if (error) {
        if (error.type === 'access') {
            return <LoginModal url={url} />
        }
        console.log(JSON.stringify(error, undefined, 2))
        throw error
    }

    i18n.changeLanguage(data.userSettings.keyUiLocale)
    return children
}
