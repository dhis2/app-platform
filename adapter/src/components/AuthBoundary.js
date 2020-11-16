import React from 'react'
import PropTypes from 'prop-types'
import { useDataQuery } from '@dhis2/app-runtime'

import { LoginModal } from './LoginModal'
import { useLocale } from '../utils/useLocale'
import { LoadingMask } from './LoadingMask'

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
    children: PropTypes.node,
    url: PropTypes.string,
}
