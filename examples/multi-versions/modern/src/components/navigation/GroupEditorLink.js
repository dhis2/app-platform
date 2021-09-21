import { useSelector } from 'react-redux'
import React from 'react'
import propTypes from '@dhis2/prop-types'
import { NavigationLink } from './NavigationLink'
import { Transform } from '../icons/Transform'
import { getSystemSettingsData, getUserAuthoritiesData } from '../../redux'
import { groupEditorSection } from '../../config'
import { hasUserAuthorityForSection } from '../../utils'

/**
 * This component is not a regular group as it needs only a subset
 * of some schema's authorities
 */
export const GroupEditorLink = ({ disabled }) => {
    const systemSettings = useSelector(getSystemSettingsData)
    const userAuthorities = useSelector(getUserAuthoritiesData)

    const userHasAuthorityForGroupEditor = hasUserAuthorityForSection({
        section: groupEditorSection,
        userAuthorities,
        systemSettings,
    })

    if (!userHasAuthorityForGroupEditor) {
        return null
    }

    return (
        <NavigationLink
            noAuth
            id="groupEditor"
            to={groupEditorSection.path}
            icon={<Transform />}
            disabled={disabled}
        />
    )
}

GroupEditorLink.propTypes = {
    disabled: propTypes.bool,
}
