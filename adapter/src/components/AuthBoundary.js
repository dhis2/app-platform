import { useDataQuery } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React from 'react'
import { useLocale } from '../utils/useLocale'
import { LoadingMask } from './LoadingMask'
import { LoginModal } from './LoginModal'

const settingsQuery = {
    userSettings: {
        resource: 'userSettings',
    },
}

export const AuthBoundary = ({ url, children }) => {
    const { loading, error, data } = useDataQuery(settingsQuery)
    useLocale(data && data.userSettings.keyUiLocale)

    if (loading) {
        return <LoadingMask />
    }

    if (error) {
        return <LoginModal url={url} />
    }

    return children
}

AuthBoundary.propTypes = {
    children: PropTypes.element,
    url: PropTypes.string,
}
